import SnowDatePicker from '@/datepicker';
import type { PickerEventProps } from '@t/event';
import { assign } from 'doumi';

class PickerEvent {
  declare datepicker: SnowDatePicker;
  declare nativeEvent?: Event | null;

  constructor({ event, ...props }: PickerEventProps = {}) {
    if (event) this.assignData({ nativeEvent: event });
    this.assignData(props);
  }

  private assignData(data: any) {
    assign(this, data);
  }
}

export default PickerEvent;
