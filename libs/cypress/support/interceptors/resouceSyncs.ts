import * as fs from 'fs';
import * as path from 'path';
import { createListMatcher } from './matchers';

const resourceSyncListFixture = (): object => {
  const fixturePath = path.resolve(__dirname, '../../../../proxy/fixtures/flightctl/resourcesyncs.list.json');
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as object;
};

const loadInterceptors = () => {
  cy.intercept('GET', createListMatcher('resourcesyncs'), (req) => {
    req.reply({
      statusCode: 200,
      body: resourceSyncListFixture(),
    });
  }).as('resource-syncs');

  cy.intercept('GET', /^\/api\/flightctl\/api\/v1\/resourcesyncs\/rs-pending-fleet(\?.*)?$/, (req) => {
    const fixturePath = path.resolve(
      __dirname,
      '../../../../proxy/fixtures/flightctl/resourcesyncs.detail.rs-pending-fleet.json',
    );
    req.reply({
      statusCode: 200,
      body: JSON.parse(fs.readFileSync(fixturePath, 'utf8')),
    });
  }).as('resource-sync-pending');

  cy.intercept('GET', /^\/api\/flightctl\/api\/v1\/resourcesyncs\/rs-error-fleet(\?.*)?$/, (req) => {
    const fixturePath = path.resolve(
      __dirname,
      '../../../../proxy/fixtures/flightctl/resourcesyncs.detail.rs-error-fleet.json',
    );
    req.reply({
      statusCode: 200,
      body: JSON.parse(fs.readFileSync(fixturePath, 'utf8')),
    });
  }).as('resource-sync-error');
};

export { loadInterceptors };
