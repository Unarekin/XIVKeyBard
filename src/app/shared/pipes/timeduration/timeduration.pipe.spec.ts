import { TimeDurationPipe } from './timeduration.pipe';

describe('TimeDurationPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeDurationPipe();
    expect(pipe).toBeTruthy();
  });
});
