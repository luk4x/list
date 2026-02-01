import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { List } from '../templates/list';
import { defaultKeyExtractor } from '../templates/list/types';

type ListRender = (props: unknown, ref: unknown) => unknown;

const renderListElementWithRef = (element: ReactElement, ref: unknown) =>
  (List as unknown as { render: ListRender }).render(element.props, ref);

const renderListElement = (element: ReactElement) =>
  renderListElementWithRef(element, null);

describe('List runtime behavior', () => {
  it('returns renderEmpty result when items is undefined', () => {
    const items = undefined as Array<number> | undefined | null;

    const output = renderListElement(
      <List items={items} renderEmpty={() => 'empty'}>
        {() => <li />}
      </List>,
    );

    expect(output).toBe('empty');
  });

  it('returns renderEmpty result when items is null', () => {
    const items = null as Array<string> | undefined | null;

    const output = renderListElement(
      <List items={items} renderEmpty={() => 123}>
        {() => <li />}
      </List>,
    );

    expect(output).toBe(123);
  });

  it('returns renderEmpty result when items is empty', () => {
    const items: Array<string> | undefined | null = [];

    const output = renderListElement(
      <List items={items} renderEmpty={() => <p>Empty</p>}>
        {() => <li />}
      </List>,
    );

    expect((output as ReactElement).type).toBe('p');
  });

  it('returns null by default when items is empty', () => {
    const output = renderListElement(<List items={[]}>{() => <li />}</List>);

    expect(output).toBeNull();
  });

  it('renders a ul by default', () => {
    const output = renderListElement(
      <List items={['a']}>{item => <li>{item}</li>}</List>,
    ) as ReactElement;

    expect(output.type).toBe('ul');
  });

  it('renders an ol when as="ol"', () => {
    const output = renderListElement(
      <List items={['a']} as="ol">
        {item => <li>{item}</li>}
      </List>,
    ) as ReactElement;

    expect(output.type).toBe('ol');
  });

  it('forwards ref to the list root', () => {
    const ref = { current: null };
    const output = renderListElementWithRef(
      <List items={['a']}>{item => <li>{item}</li>}</List>,
      ref,
    ) as ReactElement & { ref?: unknown };

    expect(output.ref).toBe(ref);
  });

  it('passes item, index, and array to children', () => {
    const items = ['a', 'b'] as const;
    const children = vi.fn((item: string, index: number) => (
      <li>
        {item}-{index}
      </li>
    ));

    renderListElement(<List items={items}>{children}</List>);

    expect(children).toHaveBeenCalledWith(items[0], 0, items);
    expect(children).toHaveBeenCalledWith(items[1], 1, items);
  });

  it('infers keys from primitive items', () => {
    const output = renderListElement(
      <List items={['a', 'b']}>{item => <li>{item}</li>}</List>,
    ) as ReactElement;

    const [first, second] = output.props.children as Array<ReactElement>;
    expect(first.key).toBe('a');
    expect(second.key).toBe('b');
  });

  it('infers keys from item.id when available', () => {
    const items = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ];
    const output = renderListElement(
      <List items={items}>{item => <li>{item.label}</li>}</List>,
    ) as ReactElement;

    const [first, second] = output.props.children as Array<ReactElement>;
    expect(first.key).toBe('a');
    expect(second.key).toBe('b');
  });

  it('uses keyExtractor when provided', () => {
    const items = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ];
    const output = renderListElement(
      <List items={items} keyExtractor={(item, index) => `${item.id}-${index}`}>
        {item => <li>{item.label}</li>}
      </List>,
    ) as ReactElement;

    const [first, second] = output.props.children as Array<ReactElement>;
    expect(first.key).toBe('a-0');
    expect(second.key).toBe('b-1');
  });

  it('throws when items are not keyable and no keyExtractor is provided', () => {
    expect(() =>
      renderListElement(
        // @ts-expect-error expecting to throw
        <List items={[{ title: 'x' }]}>{item => <li>{item.title}</li>}</List>,
      ),
    ).toThrow(/Missing keyExtractor/);
  });
});

describe('defaultKeyExtractor', () => {
  it('returns primitive items as keys', () => {
    expect(defaultKeyExtractor('a', 0)).toBe('a');
    expect(defaultKeyExtractor(1, 0)).toBe(1);
  });

  it('returns id when it is valid', () => {
    expect(defaultKeyExtractor({ id: 'a' }, 0)).toBe('a');
    expect(defaultKeyExtractor({ id: 1 }, 0)).toBe(1);
  });
});
