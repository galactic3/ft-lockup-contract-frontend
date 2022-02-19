// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// import * as JestFetchMock from 'jest-fetch-mock';

beforeEach(() => {
  global.fetch = jest.fn(() => { Prmose.reject("NETWORK ACCESS IS NOT ALLOWED IN TESTS") });
});
