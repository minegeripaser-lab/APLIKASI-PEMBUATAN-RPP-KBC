/**
 * Frontend API client for RPP KBC GENERATOR 2026
 */
import type { 
  User, 
  Subject, 
  SchoolIdentity, 
  RPPDocument, 
  AuditLog, 
  UserStats, 
  PhaseMaster, 
  PancaCintaItem, 
  DimensiProfilItem, 
  ModelPembelajaranItem, 
  MetodePembelajaranItem, 
  JenisAsesmenItem,
  MateriAjar
} from '../types/index.ts';

const TOKEN_KEY = 'min1paser_kbc_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan sistem.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: (usernameOrEmail: string, password: string) =>
    request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  // School Identity
  getSchoolIdentity: () => request<SchoolIdentity>('/api/school-identity'),
  updateSchoolIdentity: (data: Partial<SchoolIdentity>) =>
    request<{ success: boolean; data: SchoolIdentity }>('/api/school-identity', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // User Management (Super Admin)
  getUserStats: () => request<UserStats>('/api/users/stats'),
  getUsers: (params?: { search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.status) q.set('status', params.status);
    return request<User[]>(`/api/users?${q.toString()}`);
  },
  createUser: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    status: string;
  }) =>
    request<{ success: boolean; data: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<User>) =>
    request<{ success: boolean; data: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resetPassword: (id: string) =>
    request<{ success: boolean; message: string; temporaryPassword: string; username: string }>(
      `/api/users/${id}/reset-password`,
      { method: 'POST' }
    ),
  toggleUserStatus: (id: string) =>
    request<{ success: boolean; data: User }>(`/api/users/${id}/status`, {
      method: 'PATCH',
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Subject Management
  getSubjects: (params?: { search?: string; kelompok?: string; fase?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.kelompok) q.set('kelompok', params.kelompok);
    if (params?.fase) q.set('fase', params.fase);
    if (params?.status) q.set('status', params.status);
    return request<Subject[]>(`/api/subjects?${q.toString()}`);
  },
  createSubject: (data: Partial<Subject>) =>
    request<{ success: boolean; data: Subject }>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSubject: (id: string, data: Partial<Subject>) =>
    request<{ success: boolean; data: Subject }>(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleSubjectStatus: (id: string) =>
    request<{ success: boolean; data: Subject }>(`/api/subjects/${id}/status`, {
      method: 'PATCH',
    }),
  deleteSubject: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/subjects/${id}`, {
      method: 'DELETE',
    }),

  // Master Data
  getMasterData: () =>
    request<{
      phases: PhaseMaster[];
      pancaCinta: PancaCintaItem[];
      dimensiProfil: DimensiProfilItem[];
      models: ModelPembelajaranItem[];
      metode: MetodePembelajaranItem[];
      asesmen: JenisAsesmenItem[];
      schoolIdentity: SchoolIdentity;
    }>('/api/master-data'),

  updateMasterCategory: (category: string, items: unknown[]) =>
    request<{ success: boolean; message: string }>(`/api/master-data/${category}`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    }),

  // RPP Documents
  getRPPs: (params?: { search?: string; fase?: string; kelas?: string; mapelId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.fase) q.set('fase', params.fase);
    if (params?.kelas) q.set('kelas', params.kelas);
    if (params?.mapelId) q.set('mapelId', params.mapelId);
    if (params?.status) q.set('status', params.status);
    return request<RPPDocument[]>(`/api/rpps?${q.toString()}`);
  },
  getRPPById: (id: string) => request<RPPDocument>(`/api/rpps/${id}`),
  createRPP: (data: Partial<RPPDocument>) =>
    request<{ success: boolean; data: RPPDocument }>('/api/rpps', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRPP: (id: string, data: Partial<RPPDocument>) =>
    request<{ success: boolean; data: RPPDocument }>(`/api/rpps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRPP: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/rpps/${id}`, {
      method: 'DELETE',
    }),
  validateRPP: (rpp: Partial<RPPDocument>) =>
    request<{
      valid: boolean;
      score: number;
      grade: string;
      issues: string[];
      strengths: string[];
      timestamp: string;
    }>('/api/rpps/validate', {
      method: 'POST',
      body: JSON.stringify(rpp),
    }),

  // Audit Logs & Backup
  getAuditLogs: (params?: { search?: string; status?: string; action?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.action) q.set('action', params.action);
    return request<AuditLog[]>(`/api/audit-logs?${q.toString()}`);
  },
  restoreBackup: (backupData: unknown) =>
    request<{ success: boolean; message: string }>('/api/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    }),

  // AI & Generator KBC
  generateKbcContent: (params: {
    mataPelajaranNama: string;
    fase: string;
    kelas: string;
    materiPokok: string;
    pancaCintaPilihan: string[];
    modelPembelajaran?: string;
  }) =>
    request<{
      success: boolean;
      source: string;
      data: {
        capaianPembelajaran: string;
        tujuanPembelajaran: string[];
        targetKarakterCinta: string;
        kegiatanAwal: {
          durasi: string;
          salamDanDoa: string;
          apersepsiCinta: string;
          tujuanDanMotivasi: string;
        };
        kegiatanInti: {
          durasi: string;
          eksplorasiKasih: string;
          kolaborasiEmpati: string;
          internalisasiNilai: string;
          sintaksDetail: string;
        };
        kegiatanPenutup: {
          durasi: string;
          refleksiCinta: string;
          umpanBalikApresiatif: string;
          doaDanTindakLanjut: string;
        };
        asesmenFormatif: string;
        asesmenSumatif: string;
        rubrikPenilaian: string;
      };
    }>('/api/ai/generate-kbc', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  // Materi Ajar (Bahan Pembelajaran KBC)
  getMateriAjar: (params?: { search?: string; fase?: string; kelas?: string; mapelId?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.fase) q.set('fase', params.fase);
    if (params?.kelas) q.set('kelas', params.kelas);
    if (params?.mapelId) q.set('mapelId', params.mapelId);
    return request<MateriAjar[]>(`/api/materi-ajar?${q.toString()}`);
  },
  getMateriAjarById: (id: string) => request<MateriAjar>(`/api/materi-ajar/${id}`),
  createMateriAjar: (data: Partial<MateriAjar>) =>
    request<{ success: boolean; data: MateriAjar }>('/api/materi-ajar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMateriAjar: (id: string, data: Partial<MateriAjar>) =>
    request<{ success: boolean; data: MateriAjar }>(`/api/materi-ajar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMateriAjar: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/materi-ajar/${id}`, {
      method: 'DELETE',
    }),
  generateMateriAjarAI: (params: {
    mataPelajaranNama: string;
    fase: string;
    kelas: string;
    topikUtama: string;
    pancaCintaPilihan: string[];
    gayaPenyampaian?: string;
  }) =>
    request<{
      success: boolean;
      source: string;
      data: {
        judul: string;
        pengantarStimulus: string;
        uraianMateri: string;
        aktivitasSiswa: string;
        hikmahCinta: string;
        latihanSoal: string;
        glosarium: string;
      };
    }>('/api/ai/generate-materi-ajar', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};
