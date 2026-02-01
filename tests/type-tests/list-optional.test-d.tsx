import { expectType } from 'tsd';
import { List } from '../../templates/list';

const primitive = ['a', 'b'] as const;
expectType<JSX.Element>(<List items={primitive}>{x => <li>{x}</li>}</List>);

const withId = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
] as const;
expectType<JSX.Element>(<List items={withId}>{x => <li>{x.label}</li>}</List>);

// override still allowed
expectType<JSX.Element>(
  <List items={withId} keyExtractor={x => x.id}>
    {x => <li>{x.label}</li>}
  </List>,
);
