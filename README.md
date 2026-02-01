# `@luk4x/list`

A tiny, type-safe React component focused on improving DX when rendering lists. **No, this [is not another dependency in your `package.json`](#installation)**.

It removes redundancy, centralizes common list logic, and enforces (or safely infers) stable keys, making list rendering simpler and less error-prone, in a way similar to how other React environments approach list rendering.

[This component **does not**](#non-goals) style anything or hide React’s rules.

It only provides a small set of opinionated defaults and fails loudly when correctness cannot be guaranteed, with a [clean mental model to follow](#a-clean-mental-model-to-follow-explicit-identity-in-lists).

---

## Installation

This component is designed to be **copied into your codebase**, not installed as a runtime dependency. The CLI will prompt for a destination path and copy the component directly into your project.

| npm               | pnpm                   | yarn               | bun                      |
| ----------------- | ---------------------- | ------------------ | ------------------------ |
| `npx @luk4x/list` | `pnpm dlx @luk4x/list` | `yarn @luk4x/list` | `bunx --bun @luk4x/list` |

---

## Why this exists

In most React codebases, list rendering ends up looking like some variation of this boilerplate:

```tsx
{
  items?.length === 0 ? (
    <p>Empty</p>
  ) : (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

With `List`, the same output is simplified to:

```tsx
<List items={items} renderEmpty={() => <p>Empty</p>}>
  {item => <li>{item.title}</li>}
</List>
```

> "Wait, but where's `key`?" In this example, the key can be safely inferred. See [`keyExtractor`](#keyextractor) for the exact rules.

---

## API Reference

| Prop                            | Required             | Purpose                               | Default      |
| ------------------------------- | -------------------- | ------------------------------------- | ------------ |
| [`items`](#items)               | No                   | `array` of items to be rendered       | —            |
| [`children`](#children)         | Yes                  | `function` to render each list item   | —            |
| [`keyExtractor`](#keyextractor) | Depends on list type | `function` to extract a stable key    | —            |
| [`renderEmpty`](#renderempty)   | No                   | `function` to render list empty state | `() => null` |
| [`as`](#as)                     | No                   | `string` to choose the list element   | `'ul'`       |

> All native list element props (`ref`, `className`, `data-*`, `aria-*`...) are supported as well.

### `items`

**Type:** `ReadonlyArray<Item> | null | undefined`

The list of items to be rendered.

When `items` is `null`, `undefined`, or `[]`, `renderEmpty` is rendered instead.

### `children`

**Type:** `(item: Item, index: number, array: ReadonlyArray<Item>) => ReactNode`

Render function for each list item.

Prefer returning a `<li>` element to preserve correct semantics, or at least an element that has the `role="listitem"` attribute.

### `keyExtractor`

**Type:** `(item: Item, index: number) => React.Key`

Function used to extract a stable key for each list item.

This prop is **conditionally required**.

**Optional** (`key` can be inferred) when:

- `items` are primitive values that are valid as `React.Key` (typically `string` or `number`)
- `items` are objects with a stable `id: React.Key` property

**Required** (`key` cannot be inferred) when:

- primitive values are not valid keys
- `id` property is optional, `any`, or `unknown`

If `keyExtractor` is omitted when required, the component **throws at runtime**. There's no default workaround, such using `index` as fallback.

**You can always provide `keyExtractor` to explicitly override the inferred behavior if you wish.**

> The keys must be unique. If your primitive list or `id` property can contain duplicates (which is usually a data-model smell), handle it explicitly via `keyExtractor`.

### `renderEmpty`

**Type:** `() => ReactNode`  
**Default:** `() => null`

Render function used when the list has no items.

Rendered when `items` is `null`, `undefined`, or `[]`.

The list root (`ul` / `ol`) is **not rendered** when empty. This avoids rendering meaningless list containers and forces layout decisions to be explicit.

### `as`

**Type:** `'ul' | 'ol'`  
**Default:** `'ul'`

Choose the semantic list element.

---

## A clean mental model to follow: explicit identity in lists

When rendering lists in React, one rule simplifies everything:

> **Every list item must have a stable, unique property that represents its identity.**

In practice, this works best when **UI data is modeled with an explicit identity.**

### Example

Instead of relying on some implicit unique identity property:

```tsx
const profileTabs = [
  { tab: 'settings-tab', label: 'Settings', Icon: SettingsIcon },
  { tab: 'security-tab', label: 'Security', Icon: ShieldCheckIcon },
  { tab: 'billing-tab', label: 'Billing', Icon: CreditCardIcon },
];
```

Make the identity explicit:

```tsx
const profileTabs = [
  { id: 'settings-tab', label: 'Settings', Icon: SettingsIcon },
  { id: 'security-tab', label: 'Security', Icon: ShieldCheckIcon },
  { id: 'billing-tab', label: 'Billing', Icon: CreditCardIcon },
];
```

Here, `tab` was already the identity. Making it explicit as `id` simply acknowledges that fact, and removes the need for `key` ceremony when using `List`.

```tsx
<List items={profileTabs}>
  {({ id, label, Icon }) => (
    <li>
      <button onClick={() => onSelectTab(id)}>
        <Icon size={20} /> {label}
      </button>
    </li>
  )}
</List>
```

This mental model is not philosophy, it’s a clean way to align:

- your data
- your UI
- and React’s rules

<details>
<summary><b>Does this mental model hurt readability?</b></summary>
<blockquote>

Only if it’s applied in the wrong place. This isn’t a rule for all data, it’s a UI-boundary rule, meant for data that is mapped into rendered lists.

At that boundary, you have two valid options:

- keep a domain-specific field and use `keyExtractor`
- normalize identity to an `id` and remove key ceremony

Both are correct. Choose the one that reads clearer in your codebase.

In the `profileTabs` example, `tab` was already acting as identity. Renaming it to `id` doesn’t erase meaning, the context still makes it obvious what the value represents.

The difference is that now **both you and React can infer the `profileTabs` identity**, without any additional ceremony.

</blockquote>
</details>

---

## The core idea about how `List` works

In short, at runtime, `List` does exactly this:

- Renders a `<ul>` by default
- Iterates over items
- Wraps each rendered child in a `React.Fragment`
- Assigns a validated `key` to that fragment, via `keyExtractor` or inference
- Throws if a stable `key` cannot be inferred and has not been explicitly extracted

Structurally, the output is equivalent to:

```tsx
<ul>
  {items.map((item, index) => (
    <React.Fragment key={resolvedKey}>
      {children(item, index, items)}
    </React.Fragment>
  ))}
</ul>
```

### Non-goals

- No attempt is made to validate child structure beyond key handling
- No styling or layout decisions are imposed
- No effort is made to “fix” unstable or poorly shaped data
- Does not hide React behavior

## Usages

This section highlights common, practical list rendering scenarios using `List`.

### Simplest lists with inferred keys

```tsx
<List items={['Yagate Kimi ni Naru', 'Gosick', 'Ookami to Koushinryou']}>
  {animeTitle => <li>{animeTitle}</li>}
</List>
```

```tsx
<List
  items={[
    { id: 1, title: 'Yagate Kimi ni Naru' },
    { id: 2, title: 'Gosick' },
    { id: 3, title: 'Ookami to Koushinryou' },
  ]}
>
  {anime => <li>{anime.title}</li>}
</List>
```

### Lists with explicit or synthetic identity

```tsx
<List
  items={[
    { title: 'Yagate Kimi ni Naru' },
    { title: 'Gosick' },
    { title: 'Ookami to Koushinryou' },
  ]}
  keyExtractor={anime => anime.title}
>
  {anime => <li>{anime.title}</li>}
</List>
```

```tsx
const generateSkeletonKeys = (length: number, context: string) => {
  return Array.from({ length }, (_, idx) => `${context}-${idx}`);
};

<List items={generateSkeletonKeys(5, 'home-card-skeleton')}>
  {() => (
    <li>
      <Skeleton className="h-4 w-12 rounded-sm" />
    </li>
  )}
</List>;
```

### Lists with empty states

```tsx
type TAnime = { id: number; title: string; rating: number };

const animes: Array<TAnime> | undefined | null = [];

<List
  items={animes?.filter(anime => anime.rating >= 4)}
  renderEmpty={() => <p>No top-rated animes.</p>}
>
  {anime => <li>{anime.title}</li>}
</List>;
```

### Ordered lists

```tsx
<List
  as="ol"
  items={['Yagate Kimi ni Naru', 'Gosick', 'Ookami to Koushinryou']}
>
  {animeTitle => <li>{animeTitle}</li>}
</List>
```

### Overriding inferred behavior

```tsx
<List
  items={[
    { id: 1, title: 'Yagate Kimi ni Naru' },
    { id: 2, title: 'Gosick' },
    { id: 3, title: 'Ookami to Koushinryou' },
  ]}
  keyExtractor={(anime, index) => `${anime.id}-${anime.title}-${index}`}
>
  {anime => <li>{anime.title}</li>}
</List>
```
