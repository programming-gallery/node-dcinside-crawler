import 'core-js';
import { koreaDateParse } from '../src/util';
it('dateparse', () => {
  expect(koreaDateParse('2020-01-01 00:00:00').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('2020-01-01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('2020.01.01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('2020/01/01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('20/01/01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('20.01.01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('20.01.01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  expect(koreaDateParse('01.01').toISOString()).toEqual('2019-12-31T15:00:00.000Z');
  //expect(koreaDateParse('00:00').toISOString()).toEqual(new Date().toISOString().slice(0, 10) + 'T09:00.000Z');
});
