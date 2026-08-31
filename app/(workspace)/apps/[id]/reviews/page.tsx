import{redirect}from"next/navigation";export default async function AppReviews({params}:{params:Promise<{id:string}>}){const{id}=await params;redirect(`/reviews?appId=${encodeURIComponent(id)}`)}
