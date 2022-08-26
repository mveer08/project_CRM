'use strict';

const _ = require('lodash');

const { createAuthRequest } = require('../../../../../test/helpers/request');
const { createStrapiInstance } = require('../../../../../test/helpers/strapi');

const edition = process.env.STRAPI_DISABLE_EE === 'true' ? 'CE' : 'EE';

describe('Role CRUD End to End', () => {
  let rq;
  let strapi;

  beforeAll(async () => {
    strapi = await createStrapiInstance();
    rq = await createAuthRequest({ strapi });
  });

  afterAll(async () => {
    await strapi.destroy();
  });

  test('Can get the existing permissions', async () => {
    const res = await rq({
      url: '/admin/permissions',
      method: 'GET',
    });

    expect(res.statusCode).toBe(200);

    // Data is sorted to avoid error with snapshot when the data is not in the same order
    const sortedData = _.cloneDeep(res.body.data);
    Object.keys(sortedData.sections).forEach((sectionName) => {
      sortedData.sections[sectionName] = _.sortBy(sortedData.sections[sectionName], ['action']);
    });
    sortedData.conditions = sortedData.conditions.sort();

    if (edition === 'CE') {
      expect(sortedData).toMatchSnapshot();
    } else {
      // eslint-disable-next-line node/no-extraneous-require
      const { features } = require('@strapi/strapi/lib/utils/ee');
      const hasSSO = features.isEnabled('sso');

      if (hasSSO) {
        expect(sortedData).toMatchSnapshot();
      }
    }
  });
});
