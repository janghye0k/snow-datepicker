import type { PickerEventProps } from '@t/event';
import { assign } from 'doumi';
import DatePicker from '@/index';

class PickerEvent {
  constructor({ event, ...props }: PickerEventProps = {}) {
    if (event) this.assignData({ nativeEvent: event });
    this.assignData(props);
  }

  assignData(data: any) {
    assign(this, data);
  }

  setDatePicker(datepicker: DatePicker) {
    assign(this, { datepicker });
  }
}

export default PickerEvent;
