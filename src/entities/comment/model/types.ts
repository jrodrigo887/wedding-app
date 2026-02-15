/**
 * Entity: PhotoComment
 * Representa um comentário em uma foto.
 */
export interface PhotoComment {
  id?: number;
  foto_id: number;
  codigo_convidado: string;
  nome_convidado: string;
  texto: string;
  created_at?: string;
}

/**
 * Formulário para criar comentário.
 */
export interface PhotoCommentForm {
  foto_id: number;
  codigo_convidado: string;
  nome_convidado: string;
  texto: string;
}
