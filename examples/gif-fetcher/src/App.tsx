import { searchGif } from './searchGif';
import { throttle } from 'lodash';
import * as React from 'react';
import './styles.css';

import { match } from 'ts-pattern';

/**
 * The shape of our application state.
 */
type State = {
  query: string;
  data:
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; gifUrls: string[] }
    | { status: 'error'; error: Error };
};

/**
 * The union of all events our application
 * can handle.
 */
type Event =
  | { type: 'search'; query: string }
  | { type: 'success'; query: string; gifUrls: string[] }
  | { type: 'error'; query: string; error: Error }
  | { type: 'cancel' };

/**
 * Initial state of our GIF fetcher app
 */
const initState: State = {
  query: '',
  data: { status: 'idle' },
};

/**
 * All state transitions happen in this
 * reducer function
 */
const reducer = (state: State, event: Event): State =>
  match<Event, State>(event)
    .with({ type: 'search' }, ({ query }) => ({
      query,
      data: {
        status: 'loading',
      },
    }))

    .with({ type: 'cancel' }, () => ({
      ...state,
      data: { status: 'idle' },
    }))

    // only transition to success if `event.query`
    // matches `state.query`
    .with({ type: 'success', query: state.query }, ({ gifUrls }) => ({
      ...state,
      data: {
        status: 'success',
        gifUrls,
      },
    }))

    // only transition to error if `event.query`
    // matches `state.query`
    .with({ type: 'error', query: state.query }, ({ error }) => ({
      ...state,
      data: { status: 'error', error },
    }))

    .otherwise(() => state);

export default function App() {
  const [state, dispatch] = React.useReducer(reducer, initState);

  React.useEffect(() => {
    if (state.query) {
      searchGif(state.query)
        .then((urls) =>
          dispatch({
            type: 'success',
            gifUrls: urls,
            query: state.query,
          })
        )
        .catch((error) =>
          dispatch({
            type: 'error',
            error,
            query: state.query,
          })
        );
    } else {
      dispatch({ type: 'cancel' });
    }
  }, [state.query]);

  const onSearch = React.useCallback(
    throttle(
      (query: string) =>
        dispatch({
          type: 'search',
          query,
        }),
      100
    ),
    []
  );

  return (
    <div className="App">
      <input
        placeholder="Search a GIF"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div>
        {match(state.data)
          .with({ status: 'idle' }, () => (
            <>
              <h1>Idle</h1>
              <p>Nothing is happening at the moment</p>
            </>
          ))
          .with({ status: 'loading' }, () => (
            <>
              <h1>Loading...</h1>
            </>
          ))
          .with({ status: 'success', gifUrls: [] }, () => (
            <>
              <h1>No results!</h1>
            </>
          ))
          .with({ status: 'success' }, ({ gifUrls }) => (
            <>
              <h1>Fetch success!</h1>
              <div className="img-grid">
                {gifUrls.map((url) => (
                  <img key={url} src={url} alt="gif" />
                ))}
              </div>
            </>
          ))
          .with({ status: 'error' }, ({ error }) => (
            <>
              <h1>Fetch error!</h1>
              <p>{error.message}</p>
            </>
          ))
          .exhaustive()}
      </div>
    </div>
  );
}
