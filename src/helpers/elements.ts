import { create$, find$, isNull } from 'doumi';
import { CONTAINER_ID, PREFIX, cn } from './selectors';

export function createContainer() {
  const $find = find$<HTMLDivElement>('#' + CONTAINER_ID);
  if (!isNull($find)) return $find;
  const $container = create$('div', {
    id: CONTAINER_ID,
    classList: [PREFIX, CONTAINER_ID],
    role: 'presentation',
    innerHTML: /*html*/ `
        <div role="presentation" class="${cn('backdrop')}"></div>
      `,
  });
  document.body.appendChild($container);

  return $container;
}

/**
 * Convert target element to input
 */
export function convertToInput(
  target: Element,
  readOnly: boolean
): [HTMLInputElement, string] {
  const { id, className } = target;
  const originTempalte = target.outerHTML;

  const $input = create$('input', {
    id: !id ? undefined : id,
    className,
    classList: [PREFIX, `${PREFIX}-input`],
    type: 'text',
    readOnly,
  });
  target.replaceWith($input);

  return [$input, originTempalte];
}
