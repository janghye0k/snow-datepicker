import type { PickerEventProps } from '@t/event';
import { assign } from 'doumi';
import DatePicker from '@/datepicker';

class PickerEvent {
  datepicker!: DatePicker;

  constructor({ event, ...props }: PickerEventProps = {}) {
    if (event) this.assignData({ nativeEvent: event });
    this.assignData(props);
  }

  private assignData(data: any) {
    assign(this, data);
  }
}

export default PickerEvent;
