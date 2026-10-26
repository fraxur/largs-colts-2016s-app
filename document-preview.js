// Private document bytes stay in memory. The renderer and worker are local, public code.
export async function showPdfPreview(container,url,isCurrent){
 const pdfjs=await import('./assets/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('./assets/pdf.worker.mjs',import.meta.url).href;
 if(!isCurrent())return;
 const task=pdfjs.getDocument({url,isEvalSupported:false,useSystemFonts:true,useWasm:false,enableXfa:false});
 let pdf,renderTask,closed=false;
 const stop=()=>{closed=true;renderTask?.cancel();task.destroy().catch(()=>{});};
 container.addEventListener('private-preview-close',stop,{once:true});
 try{
  pdf=await task.promise;if(!isCurrent()||closed)return;
  let number=1,rendering=false;
  const controls=document.createElement('div');controls.className='private-preview-controls';
  const previous=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');
  previous.textContent='Previous page';next.textContent='Next page';previous.className=next.className='secondary-button';label.setAttribute('aria-live','polite');
  previous.hidden=next.hidden=pdf.numPages===1;
  controls.append(previous,label,next);
  const canvas=document.createElement('canvas');canvas.style.cssText='display:block;max-width:100%;height:auto;background:white;margin:12px auto';canvas.setAttribute('aria-hidden','true');
  const text=document.createElement('details'),summary=document.createElement('summary'),content=document.createElement('p');summary.textContent='Read page text';text.append(summary,content);
  container.replaceChildren(controls,canvas,text);
  async function render(){
   if(rendering||closed||!isCurrent())return;rendering=true;previous.disabled=next.disabled=true;label.textContent='Loading page '+number+'…';
   try{
    const page=await pdf.getPage(number);if(closed||!isCurrent())return;
    const original=page.getViewport({scale:1}),scale=Math.min(2,(container.clientWidth||300)/original.width),viewport=page.getViewport({scale});
    const density=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.ceil(viewport.width*density);canvas.height=Math.ceil(viewport.height*density);canvas.style.width=viewport.width+'px';
    renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[density,0,0,density,0,0]});await renderTask.promise;
    const extracted=await page.getTextContent();if(closed||!isCurrent())return;content.textContent=extracted.items.map(item=>item.str||'').join(' ');
    label.textContent='Page '+number+' of '+pdf.numPages;container.dataset.renderedPage=String(number);page.cleanup();
   }finally{rendering=false;previous.disabled=number===1;next.disabled=number===pdf.numPages;}
  }
  previous.onclick=()=>{number--;render().catch(failed);};next.onclick=()=>{number++;render().catch(failed);};
  function failed(){if(!closed&&isCurrent())label.textContent='Preview unavailable. Use Open or Download above.';}
  await render();
 }catch(error){if(!closed&&isCurrent()){container.dataset.previewError=error.name;container.textContent='Preview unavailable. Use Open or Download above.';}}
 finally{if(closed||!isCurrent())stop();}
}
