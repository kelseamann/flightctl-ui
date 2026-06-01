package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

const (
	k8sChannelStdin  = 0x00
	k8sChannelStdout = 0x01
	k8sChannelResize = 0x04
)

type terminalMetadata struct {
	Tty     bool `json:"tty"`
	Command *struct {
		Command string   `json:"command"`
		Args    []string `json:"args"`
	} `json:"command"`
}

type TerminalHandler struct {
	store *Store
}

func NewTerminalHandler(store *Store) *TerminalHandler {
	return &TerminalHandler{store: store}
}

func (h *TerminalHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if !isWebSocketRequest(r) {
		http.Error(w, "not a websocket connection", http.StatusBadRequest)
		return
	}

	deviceID := strings.Trim(mux.Vars(r)["forward"], "/")
	if !common.IsSafeResourceName(deviceID) {
		http.Error(w, "invalid device id", http.StatusBadRequest)
		return
	}

	if _, status, err := h.store.resolveFixtureDetail("flightctl/", detailPath{
		collection: "devices",
		name:       deviceID,
	}); err != nil {
		w.WriteHeader(status)
		return
	}

	meta := parseTerminalMetadata(r.URL.Query().Get("metadata"))
	upgrader := websocket.Upgrader{
		Subprotocols: []string{"v5.channel.k8s.io"},
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Warnf("mock terminal upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	log.Infof("mock terminal session for device %s (tty=%v)", deviceID, meta.Tty)

	if meta.Tty {
		runInteractiveMockShell(conn, deviceID)
		return
	}
	runNonInteractiveMockSession(conn, deviceID)
}

func isWebSocketRequest(r *http.Request) bool {
	for _, upgrade := range r.Header["Upgrade"] {
		if strings.EqualFold(upgrade, "websocket") {
			return true
		}
	}
	return false
}

func parseTerminalMetadata(raw string) terminalMetadata {
	if raw == "" {
		return terminalMetadata{Tty: true}
	}
	var meta terminalMetadata
	if err := json.Unmarshal([]byte(raw), &meta); err != nil {
		return terminalMetadata{Tty: true}
	}
	return meta
}

func stdoutFrame(text string) []byte {
	payload := []byte(text)
	frame := make([]byte, len(payload)+1)
	frame[0] = k8sChannelStdout
	copy(frame[1:], payload)
	return frame
}

func runInteractiveMockShell(conn *websocket.Conn, deviceID string) {
	prompt := fmt.Sprintf("[%s] $ ", deviceID)
	_ = conn.WriteMessage(websocket.BinaryMessage, stdoutFrame(
		"\r\n\x1b[1;32mMock device console\x1b[0m (dev:mock)\r\n"+
			"Type 'help' for available commands.\r\n\r\n"+prompt,
	))

	line := strings.Builder{}
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}
		if len(msg) == 0 {
			continue
		}

		switch msg[0] {
		case k8sChannelResize:
			continue
		case k8sChannelStdin:
			input := string(msg[1:])
			for _, ch := range input {
				switch ch {
				case '\r', '\n':
					command := strings.TrimSpace(line.String())
					line.Reset()
					response, done := handleMockCommand(command, deviceID, prompt)
					if response != "" {
						if err := conn.WriteMessage(websocket.BinaryMessage, stdoutFrame(response)); err != nil {
							return
						}
					}
					if done {
						_ = conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
						return
					}
				case '\u007f', '\b':
					if line.Len() > 0 {
						current := line.String()
						line.Reset()
						line.WriteString(current[:len(current)-1])
						_ = conn.WriteMessage(websocket.BinaryMessage, stdoutFrame("\b \b"))
					}
				default:
					line.WriteRune(ch)
					_ = conn.WriteMessage(websocket.BinaryMessage, stdoutFrame(string(ch)))
				}
			}
		}
	}
}

func handleMockCommand(command, deviceID, prompt string) (response string, done bool) {
	switch command {
	case "":
		return prompt, false
	case "help":
		return "\r\nAvailable commands: help, clear, echo <text>, exit\r\n" + prompt, false
	case "clear":
		return "\x1b[2J\x1b[H" + prompt, false
	case "exit", "logout":
		return "\r\nSession closed.\r\n", true
	default:
		if strings.HasPrefix(command, "echo ") {
			return "\r\n" + strings.TrimPrefix(command, "echo ") + "\r\n" + prompt, false
		}
		return fmt.Sprintf("\r\nmock: command not found: %s\r\n%s", command, prompt), false
	}
}

func runNonInteractiveMockSession(conn *websocket.Conn, deviceID string) {
	deadline := time.Now().Add(2 * time.Second)
	var script strings.Builder

	for time.Now().Before(deadline) {
		conn.SetReadDeadline(time.Now().Add(500 * time.Millisecond))
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		if len(msg) > 0 && msg[0] == k8sChannelStdin {
			script.Write(msg[1:])
		}
	}
	conn.SetReadDeadline(time.Time{})

	body := script.String()
	var output string
	switch {
	case strings.Contains(body, "journalctl"):
		output = mockJournalctlOutput(deviceID)
	case strings.Contains(body, "exists=") || strings.Contains(body, "stat "):
		output = mockFileProbeOutput()
	default:
		output = fmt.Sprintf("mock terminal output for %s\r\n", deviceID)
	}

	_ = conn.WriteMessage(websocket.BinaryMessage, stdoutFrame(output))
}

func mockJournalctlOutput(deviceID string) string {
	const footer = "__FLIGHTCTL_DEVICE_LOGS_EOF__"
	return fmt.Sprintf(
		"Apr 10 14:00:01 %s flightctl-agent[1234]: Agent started\r\n"+
			"Apr 10 14:05:12 %s flightctl-agent[1234]: Device enrolled successfully\r\n"+
			"Apr 10 14:30:00 %s flightctl-agent[1234]: Configuration applied\r\n"+
			"%s 0\r\n",
		deviceID, deviceID, deviceID, footer,
	)
}

func mockFileProbeOutput() string {
	const footer = "__FLIGHTCTL_DEVICE_LOGS_EOF__"
	return fmt.Sprintf("exists=1\nregular=1\nsize=128\nmime=text/plain\n%s 0\n", footer)
}
