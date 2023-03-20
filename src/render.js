
const vidSourceBtn = document.getElementById('vidSourceBtn')
const stop = document.getElementById('stopBtn')
const start = document.getElementById('startBtn')

stop.disabled = true;
start.disabled = true;
vidSourceBtn.addEventListener('mousedown', (e) =>{
    const title = {
        x: getOffset(vidSourceBtn).left,
        y: getOffset(vidSourceBtn).top,
        winX: window.scrollX,
        winY: window.scrollY,
        elemH: vidSourceBtn.offsetHeight,
    }
    e.preventDefault()

    window.electronAPI.update(title)

   
})


function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }



       
stop.addEventListener('click', ()=>{
  stop.disabled = true;
  stop.style.color = 'green';
  start.style.color = 'black';  
  start.innerText= 'Start'
  vidSourceBtn.disabled = false;
  window.startapi.stoprecording()
  })

start.addEventListener('click',()=>{
  start.style.color = 'green';
  start.innerText = 'Recording...';
  stop.style.color = 'black'
  vidSourceBtn.disabled = true;
  window.startapi.record()
  })