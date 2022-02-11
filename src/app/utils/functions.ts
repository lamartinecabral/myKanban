/**
 * returns a promise that resolves in the given time
 * usage example: await sleep(1000)
 * @param ms time in milliseconds
 */
export function sleep(ms){
  return new Promise(r=>setTimeout(()=>r(0),ms));
}