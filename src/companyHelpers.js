import api from "./api";

export const COMPANY_MEMBERS_CACHE_KEY = "company-members";
export const fetchCompanyMembers = () =>
  api.get("/company/members/").then((res) => (Array.isArray(res.data) ? res.data : res.data?.results || []));
