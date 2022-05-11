
const dom = document.querySelector('#app ul');
const width = dom.clientWidth;

const center = {
  x:width/2,
  y:width/Math.sqrt(2)
};
console.error(JSON.stringify(center))

const handler = function(e){
  const {clientX : x , clientY: y} = e.touches[0];

  if(x>center.x){
    //TODO
    return ;
  }

  if(getDirc({x,y},center) > width/2){
    //TODO
    return ;
  }

  const distanceToCenterX = width/2 - x ;
  const arc = Math.acos(distanceToCenterX/getDirc({x,y},center));
  // console.error('getDirc({x,y},center)',getDirc({x,y},center), distanceToCenterX)
  // console.error('arc',arc)
  let ancr = arc*180/Math.PI;

  if(ancr>45){
    //TODO
    return ;
  }

  console.error(ancr)
  if(y>center.y){
    ancr+=45;
  }else{
    ancr = 45-ancr
  }
  console.error('ancr',ancr)

  // console.error(e.touches[0].clientX ,e.touches[0].clientY)


}

dom.addEventListener('touchstart', handler)

dom.addEventListener('touchmove', handler)

dom.addEventListener('touchend', handler)


// document.querySelector('#app ul').style.backgroundColor='#000'



function getDirc(p1,p2) {
  var x = Math.abs(p1.x - p2.x);
  var y = Math.abs(p1.y - p2.y);

  return Math.sqrt(x**2 + y**2);
}
