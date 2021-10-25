export function rectContainsPoint(rect: DOMRect, x: number, y: number): boolean {
    if(rect.x <= x && rect.y <= y && rect.x + rect.width >= x && rect.y + rect.height >= y) {
        return true;
    }

    return false;
}

export function getSmartBoundingRect(el: HTMLElement, includeChilds?: boolean): DOMRect {
    includeChilds = includeChilds === false ? false : true; 
    
    let elStack: HTMLElement[] = [el];
    let bbox = {xStart: 999999, yStart: 999999, xEnd: -999999, yEnd: -999999};
    
    while(elStack.length !== 0) {
        let currentEl = elStack.pop();
        let elBBox = currentEl.getBoundingClientRect();

        let newXStart = elBBox.left;
        let newXEnd = elBBox.right;
        let newYStart =  elBBox.top;
        let newYEnd = elBBox.bottom;

        bbox.xStart = Math.min(bbox.xStart, newXStart);
        bbox.yStart = Math.min(bbox.yStart, newYStart);
        bbox.xEnd = Math.max(bbox.xEnd, newXEnd);
        bbox.yEnd = Math.max(bbox.yEnd, newYEnd);

        if(includeChilds) {
            let childs = Array.from(currentEl.children);
            childs.forEach(c => {
                elStack.push(c);
            });
        }
    }

    return new DOMRect(bbox.xStart, bbox.yStart, bbox.xEnd - bbox.xStart, bbox.yEnd - bbox.yStart);
}

export function checkRectInside(checkRect: DOMRect, boundingRect: DOMRect): boolean {
    if(checkRect.x >= boundingRect.x && checkRect.y >= boundingRect.y && checkRect.right <= boundingRect.right && checkRect.bottom <= boundingRect.bottom) {
        return true;
    }

    return false;
}