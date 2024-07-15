import { useEffect, useId } from 'react';
import SnowDatePicker from '../../../../dist';
import '../../../../dist/snow-datepicker.css';

export default function Scripify({ options }) {
  const id = useId();

  useEffect(() => {
    new SnowDatePicker(`[id="${id}"]`, options);
  }, [id]);

  return <div id={id}></div>;
}
