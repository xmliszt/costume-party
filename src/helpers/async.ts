type tForEachHandler = (value: any, index: number, array: Array<any>) => void;

export async function asyncForEach(
  array: Array<any>,
  callback: tForEachHandler
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
