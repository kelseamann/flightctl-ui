package mock

import "testing"

func TestHandleMockCommand(t *testing.T) {
	prompt := "[device-east-001] $ "
	response, done := handleMockCommand("help", "device-east-001", prompt)
	if done {
		t.Fatal("help should not exit")
	}
	if response == "" {
		t.Fatal("expected help output")
	}

	_, done = handleMockCommand("exit", "device-east-001", prompt)
	if !done {
		t.Fatal("exit should close session")
	}
}

func TestMockJournalctlOutputIncludesFooter(t *testing.T) {
	out := mockJournalctlOutput("device-east-001")
	if !containsAll(out, "__FLIGHTCTL_DEVICE_LOGS_EOF__", "0", "flightctl-agent") {
		t.Fatalf("unexpected journalctl mock output: %q", out)
	}
}

func containsAll(s string, parts ...string) bool {
	for _, part := range parts {
		if !contains(s, part) {
			return false
		}
	}
	return true
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 || indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
