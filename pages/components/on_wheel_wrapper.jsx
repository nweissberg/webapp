import React, { useRef, useEffect, useState } from 'react';

const WheelWrapper = ({ children, onScroll, ...props }) => {
  const scrollableArea = useRef(null);
  const [speed, set_speed] = useState(0)
  var intervalId
  const handleScroll = (e) => {
    e.preventDefault()
    e.stopPropagation()
    set_speed(e.deltaY)
    onScroll(e.deltaY);
    console.log(speed)

    clearInterval(intervalId);

    intervalId = setInterval(() => {
      set_speed((prevSpeed) => {
        if (prevSpeed === 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prevSpeed > 0 ? prevSpeed - 1 : prevSpeed + 1;
      });
    }, 10);

  };

  useEffect(() => {
    const node = scrollableArea.current;
    node.addEventListener('wheel', handleScroll);
    return () => {
      node.removeEventListener('wheel', handleScroll);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div {...props}>
      <div ref={scrollableArea} className={'flex w-full h-full absolute '+ (Math.abs(speed)>0?"z-3":"z-1")}>
      </div>
        {children}
    </div>
  );
};

export default WheelWrapper;
