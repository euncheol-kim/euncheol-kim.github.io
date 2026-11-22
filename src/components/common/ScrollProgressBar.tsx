'use client';

import { useEffect, useState } from 'react';

const ScrollProgressBar = () => {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = () => {
    // This will calculate how many pixels the page is vertically
    const winScroll = document.documentElement.scrollTop;
    // This is responsible for subtracticing the total height of the page - where the users page is scrolled to
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    // This will calculate the final total of the percentage of how much the user has scrolled.
    const scrolled = (winScroll / height) * 100;

    setScrollTop(scrolled);
  };

  useEffect(() => {
    // Fires when the document view has been scrolled
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // 헤더 맨 아래에 붙는다. 헤더 안의 마지막 요소로 그려지므로 위치를 따로 잡지 않는다.
    <div className='h-1 w-full bg-background'>
      <div className='h-1 bg-primary' style={{ width: `${scrollTop}%` }}></div>
    </div>
  );
};

export default ScrollProgressBar;
