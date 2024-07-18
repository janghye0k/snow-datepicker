import { useEffect, useId, useRef } from 'react';
import SnowDatePicker from 'snow-datepicker';
import 'snow-datepicker/snow-datepicker.css';

/**
 *
 * @param {{ options: import('snow-datepicker').Options }} param0
 * @returns
 */
export default function DatePicker({ options }) {
  const id = useId();
  const ref = useRef(null);

  useEffect(() => {
    const instance = new SnowDatePicker(`[id="${id}"]`, options);
    ref.current = instance;
  }, [id]);

  return <div id={id}></div>;
}
