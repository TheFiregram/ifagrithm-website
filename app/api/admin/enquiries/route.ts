import { jsonResponse } from "@/lib/http";
import { sessionValid } from "@/lib/admin-auth";
import { listEnquiries } from "@/lib/ifg-store";
export async function GET(){if(!(await sessionValid()))return jsonResponse({error:"Unauthorized"}, 401);try{const result=await listEnquiries();return jsonResponse(result.data,result.status);}catch{return jsonResponse({error:"Enquiries unavailable"}, 503);}}
