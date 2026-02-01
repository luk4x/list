import { expectError, expectType } from 'tsd';
import { List } from '../../templates/list';

// object without id => required keyExtractor
const noId = [{ title: 'a' }, { title: 'b' }] as const;

expectError(<List items={noId}>{x => <li>{x.title}</li>}</List>);

expectType<JSX.Element>(
  <List items={noId} keyExtractor={x => x.title}>
    {x => <li>{x.title}</li>}
  </List>,
);

// id optional => required keyExtractor
type OptionalId = { id?: string; title: string };
const optionalId: Array<OptionalId> = [{ id: 'a', title: 'A' }];

expectError(<List items={optionalId}>{x => <li>{x.title}</li>}</List>);

// id any => required keyExtractor

type AnyId = { id: any; title: string };
const anyId: Array<AnyId> = [{ id: 'a', title: 'A' }];

expectError(<List items={anyId}>{x => <li>{x.title}</li>}</List>);
