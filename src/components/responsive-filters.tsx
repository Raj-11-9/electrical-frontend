'use client';
import {useEffect,useState} from 'react';
import {SlidersHorizontal,ChevronDown} from 'lucide-react';
export function ResponsiveFilters({children}:{children:React.ReactNode}) {
  const [open,setOpen]=useState(false);
  useEffect(()=>{const media=window.matchMedia('(min-width: 761px)');const update=()=>setOpen(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return <details className="filter-panel" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary><SlidersHorizontal size={17}/>Refine your search<ChevronDown size={15} style={{marginLeft:'auto'}}/></summary>{children}</details>;
}
