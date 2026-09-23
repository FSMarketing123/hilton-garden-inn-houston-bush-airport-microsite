function initializeProperties(root,onHover=()=>{}) {
 let hovered=null;
 const items=[...root.querySelectorAll('[data-property]')];
 const update=()=>{items.forEach(el=>{const id=el.dataset.property;el.classList.toggle('is-active',id===hovered);el.classList.toggle('is-pulsing',!!hovered&&id==='hilton');el.classList.toggle('is-muted',!!hovered&&id!==hovered&&id!=='hilton')});onHover(hovered)};
 items.forEach(el=>{const id=el.dataset.property;
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){hovered=id;update()}});
 el.addEventListener('pointerleave',()=>{if(hovered===id){hovered=null;update()}});
 });
 return ()=>{hovered=null;update()};
}
const map=document.querySelector('#map'),viewport=document.querySelector('#viewport');
const clearHover=initializeProperties(map);
const W=4500,H=3003;let zoom=1,vx=0,vy=0;
function render(){const w=W/zoom,h=H/zoom;vx=Math.max(0,Math.min(W-w,vx));vy=Math.max(0,Math.min(H-h,vy));map.setAttribute('viewBox',`${vx} ${vy} ${w} ${h}`)}
function changeZoom(factor,cx=vx+W/zoom/2,cy=vy+H/zoom/2){const before=zoom;zoom=Math.max(1,Math.min(5,zoom*factor));vx=cx-(cx-vx)*before/zoom;vy=cy-(cy-vy)*before/zoom;render()}
function resetView(){zoom=1;vx=vy=0;render();clearHover()}
document.querySelector('#reset').onclick=resetView;
function point(e){const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform(map.getScreenCTM().inverse())}
viewport.addEventListener('dblclick',e=>{e.preventDefault();if(zoom>1){resetView()}else{const p=point(e);changeZoom(2,p.x,p.y)}});
let drag=null;viewport.addEventListener('pointerdown',e=>{if(e.button!==0||zoom<=1)return;map.dataset.dragged='false';drag={id:e.pointerId,x:e.clientX,y:e.clientY,vx,vy,moved:false}});
viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){drag.moved=true;map.dataset.dragged='true';viewport.classList.add('panning');viewport.setPointerCapture(e.pointerId)}if(drag.moved){const scale=map.getScreenCTM().a;vx=drag.vx-dx/scale;vy=drag.vy-dy/scale;render()}});
function endDrag(e){if(drag&&drag.id===e.pointerId){drag=null;viewport.classList.remove('panning');if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId)}}
viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);render();
