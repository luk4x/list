import {
  type ForwardedRef,
  Fragment,
  type ReactNode,
  type Ref,
  createElement,
  forwardRef,
} from 'react';

import {
  type TListElement,
  type TListProps,
  type TListRef,
  defaultKeyExtractor,
} from './types';

function _List<GItem, GElement extends TListElement = 'ul'>(
  {
    children,
    keyExtractor,
    items,
    renderEmpty = () => null,
    as: element = 'ul' as GElement,
    ...elementProps
  }: TListProps<GItem, GElement>,
  ref: ForwardedRef<TListRef<GElement>>,
) {
  const hasItems = items && items.length > 0;

  if (!hasItems) return renderEmpty();

  const handleKeyExtraction = keyExtractor ?? defaultKeyExtractor;

  return createElement(
    element,
    { ...elementProps, ref },
    items.map((item, index, array) => (
      <Fragment key={handleKeyExtraction(item, index)}>
        {children(item, index, array)}
      </Fragment>
    )),
  );
}

const ListForwardRef = forwardRef(_List);
ListForwardRef.displayName = 'List';

export const List = ListForwardRef as <
  GItem,
  GElement extends TListElement = 'ul',
>(
  listProps: TListProps<GItem, GElement> & { ref?: Ref<TListRef<GElement>> },
) => ReactNode;
