import { Ref,ref } from "vue";
interface clickEvent extends MouseEvent{
  path?: HTMLElement[] | Element[];
}
const elements: JSX.Element[] = [];
let parents: HTMLElement[] = [];
const defaultIndent: Ref<number> = ref(24);
export function setDefaultIndent(indent: number): void{
  defaultIndent.value = indent;
}
export function pushElement(element: JSX.Element): void{
  elements.push(element);
}
export function addLayer(): void{
  parents = [];
  elements.forEach((val)=>{
    parents.push(
      ((val.el as HTMLElement).parentElement as HTMLElement));
  });
  // dfs
  const stack = [...parents];
  const getLayerFromClass = (className: string) => /layer_(\d*)/gim.exec(className)?.[1];
  while (stack.length){
    const shiftItem = stack.shift() as HTMLElement;
    if (shiftItem?.classList.contains('devui-menu')){
      const children = shiftItem.children;
      stack.unshift(...Array.from(children) as HTMLElement[]);
      continue;
    } else {
      if (shiftItem.tagName === 'DIV'){
        if (shiftItem.classList.contains('devui-menu-item-vertical-wrapper')){
          const parent = shiftItem.parentElement;
          stack.unshift(...Array.from(shiftItem.children) as HTMLElement[]);
          if (parent?.classList.contains('devui-menu')){
            shiftItem.classList.add('layer_1');
          } else {
            let layer: string|number|undefined = getLayerFromClass((parent?.classList.value || '') as string);
            layer = Number(layer);
            shiftItem.classList.add(`layer_${layer}`);
          }
        } else {
          const parent = shiftItem.parentElement;
          let layer: string|number|undefined = getLayerFromClass((parent?.classList.value || '') as string);
          layer = Number(layer);
          shiftItem.classList.add(`layer_${layer}`);
          shiftItem.style.paddingLeft = `${(layer === 2 ? 1 : layer-1)*defaultIndent.value}px`;
        }
      }
      if (shiftItem.tagName === 'UL'){
        const parent = shiftItem.parentElement;
        const children = shiftItem.children;
        for (let i=0;i<children.length;i++){
          stack.unshift(children[i] as unknown as HTMLElement);
        }
        const classList = parent?.classList.value || '';
        let layer: string|undefined|number = getLayerFromClass((classList) as string);
        if (parent?.classList.contains('devui-menu')){
          layer = 1;
          shiftItem.classList.add(`layer_${2}`);
        } else {
          shiftItem.classList.add(`layer_${Number(layer)+1}`);
          layer=Number(layer)+1;
        }
      }
      if (shiftItem.tagName === 'LI'){
        const parent = shiftItem.parentElement;
        const parentClassList = parent?.classList.value || '' as string;
        let layer: number|string|undefined = getLayerFromClass(parentClassList) as string;
        getLayerFromClass(parentClassList);
        layer = Number(layer) as number;
        shiftItem.style.padding = `0 ${(layer as number)*defaultIndent.value}px`;
      }
    }
  }
}
export function changeKey(ele: HTMLElement,event: clickEvent): void{
  const stack: Element[] = [];
  const path = event.path || (event.composedPath && event.composedPath());
  for (let i=0;i<path.length;i++){
    const e = path[i] as HTMLElement;
    if (!(e.classList.contains('devui-menu'))){
      stack.push(...Array.from(e.children));
    } else {
      stack.push(...Array.from(e.children));
      break;
    }
  }
  debugger;
  while (stack.length){
    const shiftItem = stack.shift();
    if (shiftItem?.tagName === 'UL' ||
        shiftItem?.classList.contains('devui-menu-item-horizontal-wrapper')){
      stack.push(...Array.from(shiftItem?.children as unknown as Element[]));
    }
    if (shiftItem!==ele){
      if (shiftItem?.tagName === 'DIV'){
        stack.unshift(...Array.from(shiftItem?.children));
      }
      shiftItem?.classList.remove('devui-menu-item-select');
      shiftItem?.classList.remove('devui-menu-active-parent');
    }
  }
}
export function getLayer(el: HTMLElement): string | undefined{
  const getLayerReg = /layer_(\d{1,})/gim;
  const className = el.className;
  return getLayerReg.exec(className)?.[1];
}
