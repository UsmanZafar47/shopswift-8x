'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="empty-state"><h1>A little hiccup.</h1><p>We couldn’t load this page. Your saved cart is still in this browser.</p><button className="button primary" onClick={reset}>Try again</button></div>;}
