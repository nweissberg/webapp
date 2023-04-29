import { useEffect, useRef } from 'react';

function ScrollWrapper(props) {
  const divRef = useRef(null);

  useEffect(() => {
    let isUsingMouseWheel = false;
  
    const handleWheel = (e) => {
      isUsingMouseWheel = true;
      handleScroll(e);
    };
  
    const handleTouchStart = (e) => {
      isUsingMouseWheel = false;
    };
  
    const handleScroll = (e) => {
      var speed = props.speed ? props.speed : 300;
      const elem = divRef.current
      const padding = 5
      
      if (isUsingMouseWheel) {
        const has_v_scroll = hasVerticalScrollRecursive(elem, e)
        const atTop = elem.scrollTop <= padding;
        const atBottom = elem.scrollHeight - elem.scrollTop >= elem.clientHeight - padding;
        if( has_v_scroll ){
          e.stopPropagation();
        }
        
        if( Math.abs(e.deltaX) < 10 && has_v_scroll) e.preventDefault();
        if( Math.abs(e.deltaX) > 10 && Math.abs(e.deltaY) != 100 ) return;
        
        if(!atBottom) return

        if (Math.abs(e.deltaY) == 100) {
          elem.scrollLeft += e.deltaY > 0 ? speed : -speed;
        }
      }
    };
    
    const hasVerticalScrollRecursive = (parent, e) => {
      if (parent === undefined) {
        return false;
      }
      // console.log(parent.scrollLeft)
      const padding = 5
      let i = 0;
      let childElems = parent.querySelectorAll('*');
      let is_any = false
      
      const atStart = parent.scrollLeft > padding
      const atEnd = parent.scrollLeft + parent.clientWidth - parent.scrollWidth < -padding;

      if( atStart && e.deltaY < 0) is_any = true;
      if( atEnd && e.deltaY > 0) is_any = true;

      // console.log()
      // console.log(parent?.scrollTop)

      while (i < childElems.length) {
        const elem = childElems[i];
        const hasScroll = elem.scrollHeight > elem.clientHeight;
        
        if(Math.abs(e.deltaX) < 10){
          
          if( hasScroll ){
            is_any = false
            if(atEnd) is_any = true
          }
        }

        if (elem.childElementCount > 0) {
          childElems = elem.querySelectorAll('*');
          i = 0;
        } else {
          i++;
        }
      }
    
      return is_any;
    };
    
    
    
  
    const div = divRef.current;
  
    div.addEventListener('wheel', handleWheel);
    div.addEventListener('touchstart', handleTouchStart);
    div.addEventListener('scroll', handleScroll, { passive: false });
  
    return () => {
      div.removeEventListener('wheel', handleWheel);
      div.removeEventListener('touchstart', handleTouchStart);
      div.removeEventListener('scroll', handleScroll);
    };
  }, [props.speed]);
  

  return (
    <div
      ref={divRef}
      className={props.className}
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      {props.children}
    </div>
  );
}

export default ScrollWrapper;
