import { NextResponse } from "next/server";
import { sessionValid } from "@/lib/admin-auth";
import { listEnquiries } from "@/lib/ifg-store";
export async function GET(){if(!(await sessionValid()))return NextResponse.json({error:"Unauthorized"},{status:401});try{const result=await listEnquiries();return NextResponse.json(result.data,{status:result.status});}catch{return NextResponse.json({error:"Enquiries unavailable"},{status:503});}}
