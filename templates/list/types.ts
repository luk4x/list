import type {
  ComponentPropsWithoutRef,
  ElementType,
  Key,
  ReactNode,
} from 'react';

type TListElement = Extract<ElementType, 'ul' | 'ol'>;
type TItemWithValidId = { id: Key };

type TRenderChildren<GItem> = (
  item: GItem,
  index: number,
  array: ReadonlyArray<GItem>,
) => ReactNode;

type TKeyExtractor<GItem> = (item: GItem, index: number) => Key;

type TIsAny<G> = 0 extends 1 & G ? true : false;
type TIsUnknown<G> = unknown extends G
  ? [G] extends [unknown]
    ? TIsAny<G> extends true
      ? false
      : true
    : false
  : false;

type THasRequiredId<T> = T extends object
  ? 'id' extends keyof T
    ? object extends Pick<T, 'id'>
      ? false
      : true
    : false
  : false;

type TIsKeyableItem<G> = [G] extends [Key]
  ? true
  : [G] extends [{ id?: infer I }]
    ? THasRequiredId<G> extends true
      ? TIsAny<I> extends true
        ? false
        : TIsUnknown<I> extends true
          ? false
          : [I] extends [Key]
            ? true
            : false
      : false
    : false;

type TKeyExtractorRequirement<GItem> =
  TIsKeyableItem<GItem> extends true
    ? { keyExtractor?: TKeyExtractor<GItem> }
    : { keyExtractor: TKeyExtractor<GItem> };

type TListBaseProps<GItem, GElement> = {
  /**
   * Render function for each item in the list.
   *
   * Prefer return a `<li>` element to preserve correct semantics, or at least an element that has the `role="listitem"` attribute.
   */
  children: TRenderChildren<GItem>;

  /**
   * Array of items to be rendered.
   *
   * - If `null`, `undefined` or `[]`, `renderEmpty` will be rendered instead.
   */
  items?: ReadonlyArray<GItem> | null;

  /**
   * Function rendered when `items` is `null`, `undefined` or `[]`.
   *
   * The List root element (`ul` / `ol`) is NOT rendered in this case.
   *
   * @default () => null
   */
  renderEmpty?: () => ReactNode;

  /**
   * Semantic element used as the list root (`ul` / `ol`).
   *
   * @default 'ul'
   */
  as?: GElement;

  /**
   * Function used to extract a stable key for each list item.
   *
   * This prop is **conditionally required**.
   *
   * **Optional** (`key` can be inferred) when:
   * - `items` are primitive values that are valid as `React.Key` (typically `string` or `number`)
   * - `items` are objects with a stable `id: React.Key` property
   *
   * **Required** (`key` cannot be inferred) when:
   * - primitive values are not valid keys
   * - `id` property is optional, `any`, or `unknown`
   *
   * If `keyExtractor` is omitted when required, the component **throws at runtime**. There's no default workaround, such using `index` as fallback.
   *
   * **You can always provide `keyExtractor` to explicitly override the inferred behavior if you wish.**
   *
   * > The keys must be unique. If your primitive list or `id` property can contain duplicates (which is usually a data-model smell), handle it explicitly via `keyExtractor`.
   */
  keyExtractor?: TKeyExtractor<GItem>;
} & TKeyExtractorRequirement<GItem>;

type TListRef<GElement extends TListElement> = GElement extends 'ul'
  ? HTMLUListElement
  : HTMLOListElement;

type TListProps<GItem, GElement extends TListElement> = TListBaseProps<
  GItem,
  GElement
> &
  Omit<
    ComponentPropsWithoutRef<GElement>,
    keyof TListBaseProps<GItem, GElement>
  >;

function isValidKey(value: unknown): value is Key {
  return ['string', 'number', 'bigint'].includes(typeof value);
}

function hasValidId(item: unknown): item is TItemWithValidId {
  const itemHasId = item && typeof item === 'object' && 'id' in item;
  if (!itemHasId) return false;

  return isValidKey(item.id);
}

function defaultKeyExtractor<GItem>(item: GItem, index: number): Key {
  if (isValidKey(item)) return item;
  if (hasValidId(item)) return item.id;

  throw new Error(
    `[List] Missing keyExtractor. keyExtractor is required when items are not valid as React.Key or objects do not have a stable { id: React.Key } property. Error on items[${index}].`,
  );
}

export {
  defaultKeyExtractor,
  type TListElement,
  type TListProps,
  type TListRef,
};
