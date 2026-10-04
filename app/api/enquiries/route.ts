import { NextResponse } from "next/server";
import { storeConfigured,submitEnquiry } from "@/lib/ifg-store";
export async function POST(request:Request){
 if(!storeConfigured())return NextResponse.json({error:"Enquiry storage is unavailable."},{status:503});
 try{const data=await request.json();if(!data || typeof data!=="object")return NextResponse.json({error:"Invalid enquiry."},{status:400});const result=await submitEnquiry(data);return NextResponse.json(result.data,{status:result.status});}
 catch{return NextResponse.json({error:"Could not save your enquiry."},{status:503});}
}
