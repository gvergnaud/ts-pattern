import { isMatching, P } from 'ts-pattern';
import { API_KEY } from './constants';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function searchGif(query: string) {
  return fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}&limit=25&offset=0&rating=g&lang=en`
  )
    .then((res) => res.json())
    .then(async (res) => {
      await delay(500);
      return res;
    })
    .then((res: unknown) => {
      if (
        isMatching(
          {
            data: P.array({
              images: {
                fixed_height: {
                  url: P.string,
                },
              },
            }),
          },
          res
        )
      ) {
        // Note how `isMatching` narrows the type of `res`:
        return res.data.map(({ images }) => images.fixed_height.url);
      } else {
        throw new Error('Oh, no! The HTTP request failed.');
      }
    });
}
