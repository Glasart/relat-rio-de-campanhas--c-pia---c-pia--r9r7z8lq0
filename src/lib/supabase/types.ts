// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      campanhas_old_backup: {
        Row: {
          alcance: number | null
          cliques_ads: number | null
          cliques_rd: number | null
          criado_em: string
          ctr: number | null
          cvl: number | null
          data_fim: string | null
          data_inicio: string | null
          dif_cliques: number | null
          id: string
          impressoes: number | null
          investimento: number | null
          leads_orcamento: number | null
          leads_plan: number | null
          leads_rd: number | null
          nome_campanha: string | null
          orcamento_pedido: number | null
          orcamentos_qtd: number | null
          pedidos_qtd: number | null
          plataforma_canal: string | null
          publico: string | null
          usuario_id: string
          valor_orcamento: number | null
          valor_pedidos: number | null
        }
        Insert: {
          alcance?: number | null
          cliques_ads?: number | null
          cliques_rd?: number | null
          criado_em?: string
          ctr?: number | null
          cvl?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          dif_cliques?: number | null
          id?: string
          impressoes?: number | null
          investimento?: number | null
          leads_orcamento?: number | null
          leads_plan?: number | null
          leads_rd?: number | null
          nome_campanha?: string | null
          orcamento_pedido?: number | null
          orcamentos_qtd?: number | null
          pedidos_qtd?: number | null
          plataforma_canal?: string | null
          publico?: string | null
          usuario_id: string
          valor_orcamento?: number | null
          valor_pedidos?: number | null
        }
        Update: {
          alcance?: number | null
          cliques_ads?: number | null
          cliques_rd?: number | null
          criado_em?: string
          ctr?: number | null
          cvl?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          dif_cliques?: number | null
          id?: string
          impressoes?: number | null
          investimento?: number | null
          leads_orcamento?: number | null
          leads_plan?: number | null
          leads_rd?: number | null
          nome_campanha?: string | null
          orcamento_pedido?: number | null
          orcamentos_qtd?: number | null
          pedidos_qtd?: number | null
          plataforma_canal?: string | null
          publico?: string | null
          usuario_id?: string
          valor_orcamento?: number | null
          valor_pedidos?: number | null
        }
        Relationships: []
      }
      canais_comunicacao: {
        Row: {
          acessos: number | null
          canal_nome: string | null
          cliques: number | null
          conversas: number | null
          criado_em: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          lead_orcamento_pct: number | null
          leads: number | null
          orcamento_pedido_pct: number | null
          orcamentos_qtd: number | null
          orcamentos_valor: number | null
          pedidos_qtd: number | null
          pedidos_valor: number | null
          usuario_id: string
        }
        Insert: {
          acessos?: number | null
          canal_nome?: string | null
          cliques?: number | null
          conversas?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          lead_orcamento_pct?: number | null
          leads?: number | null
          orcamento_pedido_pct?: number | null
          orcamentos_qtd?: number | null
          orcamentos_valor?: number | null
          pedidos_qtd?: number | null
          pedidos_valor?: number | null
          usuario_id: string
        }
        Update: {
          acessos?: number | null
          canal_nome?: string | null
          cliques?: number | null
          conversas?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          lead_orcamento_pct?: number | null
          leads?: number | null
          orcamento_pedido_pct?: number | null
          orcamentos_qtd?: number | null
          orcamentos_valor?: number | null
          pedidos_qtd?: number | null
          pedidos_valor?: number | null
          usuario_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          cnpj: string
          criado_por: string
          data_cadastro: string | null
          email: string
          endereco: string
          estado: string
          id: string
          nome: string
          razao_social: string
          whatsapp: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          cnpj: string
          criado_por: string
          data_cadastro?: string | null
          email: string
          endereco: string
          estado: string
          id?: string
          nome: string
          razao_social: string
          whatsapp: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          cnpj?: string
          criado_por?: string
          data_cadastro?: string | null
          email?: string
          endereco?: string
          estado?: string
          id?: string
          nome?: string
          razao_social?: string
          whatsapp?: string
        }
        Relationships: []
      }
      cotacoes_frete: {
        Row: {
          criado_por: string
          data_cotacao: string | null
          forma_pagamento: string
          id: string
          pdf_gerado: boolean | null
          pedido_id: string
          prazo_entrega: number
          transportadora_id: string
          valor_frete: number
        }
        Insert: {
          criado_por: string
          data_cotacao?: string | null
          forma_pagamento: string
          id?: string
          pdf_gerado?: boolean | null
          pedido_id: string
          prazo_entrega: number
          transportadora_id: string
          valor_frete: number
        }
        Update: {
          criado_por?: string
          data_cotacao?: string | null
          forma_pagamento?: string
          id?: string
          pdf_gerado?: boolean | null
          pedido_id?: string
          prazo_entrega?: number
          transportadora_id?: string
          valor_frete?: number
        }
        Relationships: [
          {
            foreignKeyName: 'cotacoes_frete_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cotacoes_frete_transportadora_id_fkey'
            columns: ['transportadora_id']
            isOneToOne: false
            referencedRelation: 'transportadoras'
            referencedColumns: ['id']
          },
        ]
      }
      historico_atualizacoes: {
        Row: {
          data_atualizacao: string | null
          id: string
          notas: string | null
          pedido_id: string
          status_anterior: string | null
          status_novo: string
          tipo_acao: string | null
          usuario_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          id?: string
          notas?: string | null
          pedido_id: string
          status_anterior?: string | null
          status_novo: string
          tipo_acao?: string | null
          usuario_id: string
        }
        Update: {
          data_atualizacao?: string | null
          id?: string
          notas?: string | null
          pedido_id?: string
          status_anterior?: string | null
          status_novo?: string
          tipo_acao?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'historico_atualizacoes_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
        ]
      }
      itens_pedido: {
        Row: {
          cubagem_cm: string
          id: string
          numero_item: number
          pedido_id: string
          peso_total: number
          peso_unitario: number
          quantidade_volume: number
        }
        Insert: {
          cubagem_cm: string
          id?: string
          numero_item: number
          pedido_id: string
          peso_total: number
          peso_unitario: number
          quantidade_volume: number
        }
        Update: {
          cubagem_cm?: string
          id?: string
          numero_item?: number
          pedido_id?: string
          peso_total?: number
          peso_unitario?: number
          quantidade_volume?: number
        }
        Relationships: [
          {
            foreignKeyName: 'itens_pedido_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
        ]
      }
      notificacoes_enviadas: {
        Row: {
          canal: string
          cliente_email: string
          cliente_telefone: string | null
          data_envio: string | null
          erro_mensagem: string | null
          id: string
          mensagem_enviada: string
          pedido_id: string
          status_envio: string | null
        }
        Insert: {
          canal: string
          cliente_email: string
          cliente_telefone?: string | null
          data_envio?: string | null
          erro_mensagem?: string | null
          id?: string
          mensagem_enviada: string
          pedido_id: string
          status_envio?: string | null
        }
        Update: {
          canal?: string
          cliente_email?: string
          cliente_telefone?: string | null
          data_envio?: string | null
          erro_mensagem?: string | null
          id?: string
          mensagem_enviada?: string
          pedido_id?: string
          status_envio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notificacoes_enviadas_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
        ]
      }
      outros_canais: {
        Row: {
          acessos: number | null
          canal_nome: string | null
          cliques: number | null
          conversas: number | null
          criado_em: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          lead_orcamento_pct: number | null
          leads: number | null
          orcamento_pedido_pct: number | null
          orcamentos_qtd: number | null
          orcamentos_valor: number | null
          pedidos_qtd: number | null
          pedidos_valor: number | null
          usuario_id: string
        }
        Insert: {
          acessos?: number | null
          canal_nome?: string | null
          cliques?: number | null
          conversas?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          lead_orcamento_pct?: number | null
          leads?: number | null
          orcamento_pedido_pct?: number | null
          orcamentos_qtd?: number | null
          orcamentos_valor?: number | null
          pedidos_qtd?: number | null
          pedidos_valor?: number | null
          usuario_id: string
        }
        Update: {
          acessos?: number | null
          canal_nome?: string | null
          cliques?: number | null
          conversas?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          lead_orcamento_pct?: number | null
          leads?: number | null
          orcamento_pedido_pct?: number | null
          orcamentos_qtd?: number | null
          orcamentos_valor?: number | null
          pedidos_qtd?: number | null
          pedidos_valor?: number | null
          usuario_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          atualizado_em: string | null
          cliente_id: string
          criado_por: string
          data_criacao: string | null
          id: string
          notas_internas: string | null
          numero_rastreio: string
          previsao_entrega: string
          status: string
          transportadora: string
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id: string
          criado_por: string
          data_criacao?: string | null
          id?: string
          notas_internas?: string | null
          numero_rastreio: string
          previsao_entrega: string
          status?: string
          transportadora: string
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string
          criado_por?: string
          data_criacao?: string | null
          id?: string
          notas_internas?: string | null
          numero_rastreio?: string
          previsao_entrega?: string
          status?: string
          transportadora?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pedidos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      performance_campanha: {
        Row: {
          alcance: number | null
          campanha_nome: string | null
          cliques: number | null
          cliques_base_ads: number | null
          cliques_base_rd: number | null
          conversoes: number | null
          criado_em: string
          ctr: number | null
          cvl: number | null
          data_fim: string | null
          data_inicio: string | null
          dif_cliques: number | null
          dif_leads: number | null
          id: string
          impressoes: number | null
          investimento: number | null
          leads: number | null
          leads_base_planilhas_vendas: number | null
          leads_base_rd: number | null
          leads_orcamento: number | null
          orcamento_pedido: number | null
          orcamentos_semana: number | null
          ordem: number | null
          pedidos_semana: number | null
          plataforma: string | null
          publico: string | null
          roi: number | null
          usuario_id: string
        }
        Insert: {
          alcance?: number | null
          campanha_nome?: string | null
          cliques?: number | null
          cliques_base_ads?: number | null
          cliques_base_rd?: number | null
          conversoes?: number | null
          criado_em?: string
          ctr?: number | null
          cvl?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          dif_cliques?: number | null
          dif_leads?: number | null
          id?: string
          impressoes?: number | null
          investimento?: number | null
          leads?: number | null
          leads_base_planilhas_vendas?: number | null
          leads_base_rd?: number | null
          leads_orcamento?: number | null
          orcamento_pedido?: number | null
          orcamentos_semana?: number | null
          ordem?: number | null
          pedidos_semana?: number | null
          plataforma?: string | null
          publico?: string | null
          roi?: number | null
          usuario_id: string
        }
        Update: {
          alcance?: number | null
          campanha_nome?: string | null
          cliques?: number | null
          cliques_base_ads?: number | null
          cliques_base_rd?: number | null
          conversoes?: number | null
          criado_em?: string
          ctr?: number | null
          cvl?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          dif_cliques?: number | null
          dif_leads?: number | null
          id?: string
          impressoes?: number | null
          investimento?: number | null
          leads?: number | null
          leads_base_planilhas_vendas?: number | null
          leads_base_rd?: number | null
          leads_orcamento?: number | null
          orcamento_pedido?: number | null
          orcamentos_semana?: number | null
          ordem?: number | null
          pedidos_semana?: number | null
          plataforma?: string | null
          publico?: string | null
          roi?: number | null
          usuario_id?: string
        }
        Relationships: []
      }
      performance_campanha_historico: {
        Row: {
          campanha_id: string | null
          cliques_base_rd_semana_anterior: number | null
          criado_em: string
          id: string
          leads_base_rd_semana_anterior: number | null
        }
        Insert: {
          campanha_id?: string | null
          cliques_base_rd_semana_anterior?: number | null
          criado_em?: string
          id?: string
          leads_base_rd_semana_anterior?: number | null
        }
        Update: {
          campanha_id?: string | null
          cliques_base_rd_semana_anterior?: number | null
          criado_em?: string
          id?: string
          leads_base_rd_semana_anterior?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'performance_campanha_historico_campanha_id_fkey'
            columns: ['campanha_id']
            isOneToOne: false
            referencedRelation: 'performance_campanha'
            referencedColumns: ['id']
          },
        ]
      }
      templates_mensagem: {
        Row: {
          corpo: string
          criado_por: string
          data_criacao: string | null
          id: string
          status: string
          titulo: string
          variaveis: Json | null
        }
        Insert: {
          corpo: string
          criado_por: string
          data_criacao?: string | null
          id?: string
          status: string
          titulo: string
          variaveis?: Json | null
        }
        Update: {
          corpo?: string
          criado_por?: string
          data_criacao?: string | null
          id?: string
          status?: string
          titulo?: string
          variaveis?: Json | null
        }
        Relationships: []
      }
      transportadoras: {
        Row: {
          ativo: boolean | null
          criado_por: string
          forma_pagamento: string
          id: string
          nome: string
          prazo_entrega: number
          valor_frete: number
        }
        Insert: {
          ativo?: boolean | null
          criado_por: string
          forma_pagamento: string
          id?: string
          nome: string
          prazo_entrega: number
          valor_frete: number
        }
        Update: {
          ativo?: boolean | null
          criado_por?: string
          forma_pagamento?: string
          id?: string
          nome?: string
          prazo_entrega?: number
          valor_frete?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          criado_em: string
          email: string
          id: string
          nome: string
          senha: string | null
        }
        Insert: {
          criado_em?: string
          email: string
          id: string
          nome: string
          senha?: string | null
        }
        Update: {
          criado_em?: string
          email?: string
          id?: string
          nome?: string
          senha?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: campanhas_old_backup
//   id: uuid (not null, default: gen_random_uuid())
//   data_inicio: date (nullable)
//   data_fim: date (nullable)
//   plataforma_canal: text (nullable)
//   nome_campanha: text (nullable)
//   publico: text (nullable)
//   investimento: numeric (nullable, default: 0)
//   impressoes: numeric (nullable, default: 0)
//   alcance: numeric (nullable, default: 0)
//   cliques_rd: numeric (nullable, default: 0)
//   cliques_ads: numeric (nullable, default: 0)
//   ctr: numeric (nullable, default: 0)
//   dif_cliques: numeric (nullable, default: 0)
//   leads_plan: numeric (nullable, default: 0)
//   leads_rd: numeric (nullable, default: 0)
//   cvl: numeric (nullable, default: 0)
//   orcamentos_qtd: numeric (nullable, default: 0)
//   valor_orcamento: numeric (nullable, default: 0)
//   pedidos_qtd: numeric (nullable, default: 0)
//   valor_pedidos: numeric (nullable, default: 0)
//   leads_orcamento: numeric (nullable, default: 0)
//   orcamento_pedido: numeric (nullable, default: 0)
//   usuario_id: uuid (not null)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: canais_comunicacao
//   id: uuid (not null, default: gen_random_uuid())
//   data_inicio: date (nullable)
//   data_fim: date (nullable)
//   canal_nome: text (nullable)
//   acessos: numeric (nullable, default: 0)
//   cliques: numeric (nullable, default: 0)
//   conversas: numeric (nullable, default: 0)
//   leads: numeric (nullable, default: 0)
//   orcamentos_qtd: numeric (nullable, default: 0)
//   orcamentos_valor: numeric (nullable, default: 0)
//   pedidos_qtd: numeric (nullable, default: 0)
//   pedidos_valor: numeric (nullable, default: 0)
//   lead_orcamento_pct: numeric (nullable, default: 0)
//   orcamento_pedido_pct: numeric (nullable, default: 0)
//   usuario_id: uuid (not null)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: clientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cnpj: text (not null)
//   razao_social: text (not null)
//   whatsapp: text (not null)
//   email: text (not null)
//   cep: text (not null)
//   endereco: text (not null)
//   bairro: text (not null)
//   cidade: text (not null)
//   estado: text (not null)
//   data_cadastro: timestamp with time zone (nullable, default: now())
//   criado_por: uuid (not null)
// Table: cotacoes_frete
//   id: uuid (not null, default: gen_random_uuid())
//   pedido_id: uuid (not null)
//   transportadora_id: uuid (not null)
//   valor_frete: numeric (not null)
//   prazo_entrega: integer (not null)
//   forma_pagamento: text (not null)
//   data_cotacao: timestamp with time zone (nullable, default: now())
//   pdf_gerado: boolean (nullable, default: false)
//   criado_por: uuid (not null)
// Table: historico_atualizacoes
//   id: uuid (not null, default: gen_random_uuid())
//   pedido_id: uuid (not null)
//   status_anterior: text (nullable)
//   status_novo: text (not null)
//   data_atualizacao: timestamp with time zone (nullable, default: now())
//   usuario_id: uuid (not null)
//   notas: text (nullable)
//   tipo_acao: text (nullable)
// Table: itens_pedido
//   id: uuid (not null, default: gen_random_uuid())
//   pedido_id: uuid (not null)
//   numero_item: integer (not null)
//   quantidade_volume: integer (not null)
//   cubagem_cm: text (not null)
//   peso_unitario: numeric (not null)
//   peso_total: numeric (not null)
// Table: notificacoes_enviadas
//   id: uuid (not null, default: gen_random_uuid())
//   pedido_id: uuid (not null)
//   cliente_email: text (not null)
//   cliente_telefone: text (nullable)
//   canal: text (not null)
//   mensagem_enviada: text (not null)
//   data_envio: timestamp with time zone (nullable, default: now())
//   status_envio: text (nullable)
//   erro_mensagem: text (nullable)
// Table: outros_canais
//   id: uuid (not null, default: gen_random_uuid())
//   data_inicio: date (nullable)
//   data_fim: date (nullable)
//   canal_nome: text (nullable)
//   acessos: numeric (nullable, default: 0)
//   cliques: numeric (nullable, default: 0)
//   conversas: numeric (nullable, default: 0)
//   leads: numeric (nullable, default: 0)
//   orcamentos_qtd: numeric (nullable, default: 0)
//   orcamentos_valor: numeric (nullable, default: 0)
//   pedidos_qtd: numeric (nullable, default: 0)
//   pedidos_valor: numeric (nullable, default: 0)
//   lead_orcamento_pct: numeric (nullable, default: 0)
//   orcamento_pedido_pct: numeric (nullable, default: 0)
//   usuario_id: uuid (not null)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: pedidos
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (not null)
//   status: text (not null, default: 'Coleta Agendada'::text)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   previsao_entrega: timestamp with time zone (not null)
//   transportadora: text (not null)
//   numero_rastreio: text (not null)
//   notas_internas: text (nullable)
//   criado_por: uuid (not null)
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: performance_campanha
//   id: uuid (not null, default: gen_random_uuid())
//   data_inicio: date (nullable)
//   data_fim: date (nullable)
//   campanha_nome: text (nullable)
//   impressoes: numeric (nullable, default: 0)
//   alcance: numeric (nullable, default: 0)
//   cliques: numeric (nullable, default: 0)
//   ctr: numeric (nullable, default: 0)
//   leads: numeric (nullable, default: 0)
//   conversoes: numeric (nullable, default: 0)
//   roi: numeric (nullable, default: 0)
//   usuario_id: uuid (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   plataforma: text (nullable)
//   publico: text (nullable)
//   investimento: numeric (nullable, default: 0)
//   cliques_base_ads: numeric (nullable, default: 0)
//   cliques_base_rd: numeric (nullable, default: 0)
//   leads_base_planilhas_vendas: numeric (nullable, default: 0)
//   leads_base_rd: numeric (nullable, default: 0)
//   orcamentos_semana: numeric (nullable, default: 0)
//   pedidos_semana: numeric (nullable, default: 0)
//   dif_cliques: numeric (nullable, default: 0)
//   cvl: numeric (nullable, default: 0)
//   dif_leads: numeric (nullable, default: 0)
//   leads_orcamento: numeric (nullable, default: 0)
//   orcamento_pedido: numeric (nullable, default: 0)
//   ordem: integer (nullable, default: 0)
// Table: performance_campanha_historico
//   id: uuid (not null, default: gen_random_uuid())
//   campanha_id: uuid (nullable)
//   cliques_base_rd_semana_anterior: numeric (nullable, default: 0)
//   leads_base_rd_semana_anterior: numeric (nullable, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: templates_mensagem
//   id: uuid (not null, default: gen_random_uuid())
//   status: text (not null)
//   titulo: text (not null)
//   corpo: text (not null)
//   variaveis: jsonb (nullable, default: '{}'::jsonb)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   criado_por: uuid (not null)
// Table: transportadoras
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   valor_frete: numeric (not null)
//   prazo_entrega: integer (not null)
//   forma_pagamento: text (not null)
//   ativo: boolean (nullable, default: true)
//   criado_por: uuid (not null)
// Table: usuarios
//   id: uuid (not null)
//   email: text (not null)
//   nome: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   senha: text (nullable)

// --- CONSTRAINTS ---
// Table: campanhas_old_backup
//   PRIMARY KEY campanhas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY campanhas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: canais_comunicacao
//   PRIMARY KEY canais_comunicacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY canais_comunicacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: clientes
//   UNIQUE clientes_cnpj_key: UNIQUE (cnpj)
//   FOREIGN KEY clientes_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
// Table: cotacoes_frete
//   FOREIGN KEY cotacoes_frete_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY cotacoes_frete_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
//   PRIMARY KEY cotacoes_frete_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cotacoes_frete_transportadora_id_fkey: FOREIGN KEY (transportadora_id) REFERENCES transportadoras(id) ON DELETE CASCADE
// Table: historico_atualizacoes
//   FOREIGN KEY historico_atualizacoes_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
//   PRIMARY KEY historico_atualizacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_atualizacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: itens_pedido
//   FOREIGN KEY itens_pedido_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
//   PRIMARY KEY itens_pedido_pkey: PRIMARY KEY (id)
// Table: notificacoes_enviadas
//   FOREIGN KEY notificacoes_enviadas_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
//   PRIMARY KEY notificacoes_enviadas_pkey: PRIMARY KEY (id)
// Table: outros_canais
//   PRIMARY KEY outros_canais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY outros_canais_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pedidos
//   FOREIGN KEY pedidos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY pedidos_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE pedidos_numero_rastreio_key: UNIQUE (numero_rastreio)
//   PRIMARY KEY pedidos_pkey: PRIMARY KEY (id)
// Table: performance_campanha
//   PRIMARY KEY performance_campanha_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_campanha_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: performance_campanha_historico
//   FOREIGN KEY performance_campanha_historico_campanha_id_fkey: FOREIGN KEY (campanha_id) REFERENCES performance_campanha(id) ON DELETE CASCADE
//   PRIMARY KEY performance_campanha_historico_pkey: PRIMARY KEY (id)
// Table: templates_mensagem
//   FOREIGN KEY templates_mensagem_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY templates_mensagem_pkey: PRIMARY KEY (id)
// Table: transportadoras
//   FOREIGN KEY transportadoras_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE transportadoras_nome_key: UNIQUE (nome)
//   PRIMARY KEY transportadoras_pkey: PRIMARY KEY (id)
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: campanhas_old_backup
//   Policy "campanhas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "campanhas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "campanhas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "campanhas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: canais_comunicacao
//   Policy "canais_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes
//   Policy "admin_all_clientes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
//   Policy "anon_select_clientes" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: cotacoes_frete
//   Policy "admin_all_cotacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
// Table: historico_atualizacoes
//   Policy "admin_all_historico" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "anon_select_historico" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: itens_pedido
//   Policy "admin_all_itens" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: notificacoes_enviadas
//   Policy "admin_all_notificacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: outros_canais
//   Policy "outros_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "outros_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "outros_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "outros_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pedidos
//   Policy "admin_all_pedidos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
//   Policy "anon_select_pedidos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: performance_campanha
//   Policy "perf_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "perf_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "perf_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "perf_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: templates_mensagem
//   Policy "admin_all_templates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
// Table: transportadoras
//   Policy "admin_all_transportadoras" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (criado_por = auth.uid())
// Table: usuarios
//   Policy "usuarios_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true

// --- WARNING: TABLES WITH RLS ENABLED BUT NO POLICIES ---
// These tables have Row Level Security enabled but NO policies defined.
// This means ALL queries (SELECT, INSERT, UPDATE, DELETE) will return ZERO rows
// for non-superuser roles (including the anon and authenticated roles used by the app).
// You MUST create RLS policies for these tables to allow data access.
//   - performance_campanha_historico

// --- DATABASE FUNCTIONS ---
// FUNCTION calc_outros_canais()
//   CREATE OR REPLACE FUNCTION public.calc_outros_canais()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.lead_orcamento_pct := CASE WHEN NEW.orcamentos_qtd > 0 THEN (NEW.leads / NEW.orcamentos_qtd) * 100 ELSE 0 END;
//       NEW.orcamento_pedido_pct := CASE WHEN NEW.pedidos_qtd > 0 THEN (NEW.orcamentos_qtd / NEW.pedidos_qtd) * 100 ELSE 0 END;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION calc_performance_campanha()
//   CREATE OR REPLACE FUNCTION public.calc_performance_campanha()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.ctr := CASE WHEN NEW.impressoes > 0 THEN (NEW.cliques / NEW.impressoes) * 100 ELSE 0 END;
//       NEW.roi := CASE WHEN NEW.leads > 0 THEN (NEW.conversoes / NEW.leads) * 100 ELSE 0 END;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION calc_performance_campanha_new()
//   CREATE OR REPLACE FUNCTION public.calc_performance_campanha_new()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       hist RECORD;
//   BEGIN
//       NEW.ctr := CASE WHEN NEW.impressoes > 0 THEN (NEW.cliques_base_ads / NEW.impressoes) * 100 ELSE 0 END;
//       NEW.cvl := CASE WHEN NEW.leads_base_planilhas_vendas > 0 THEN NEW.leads_base_rd / NEW.leads_base_planilhas_vendas ELSE 0 END;
//       NEW.leads_orcamento := CASE WHEN NEW.orcamentos_semana > 0 THEN (NEW.leads_base_rd / NEW.orcamentos_semana) * 100 ELSE 0 END;
//       NEW.orcamento_pedido := CASE WHEN NEW.pedidos_semana > 0 THEN (NEW.orcamentos_semana / NEW.pedidos_semana) * 100 ELSE 0 END;
//
//       SELECT * INTO hist FROM public.performance_campanha_historico WHERE campanha_id = NEW.id ORDER BY criado_em DESC LIMIT 1;
//       IF FOUND THEN
//           NEW.dif_cliques := NEW.cliques_base_rd - hist.cliques_base_rd_semana_anterior;
//           NEW.dif_leads := NEW.leads_base_rd - hist.leads_base_rd_semana_anterior;
//       ELSE
//           NEW.dif_cliques := NEW.cliques_base_rd;
//           NEW.dif_leads := NEW.leads_base_rd;
//       END IF;
//
//       NEW.cliques := NEW.cliques_base_ads;
//       NEW.leads := NEW.leads_base_rd;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION calculate_campanhas_metrics()
//   CREATE OR REPLACE FUNCTION public.calculate_campanhas_metrics()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       hist RECORD;
//   BEGIN
//       NEW.ctr := CASE WHEN NEW.impressoes > 0 THEN (NEW.cliques_base_ads / NEW.impressoes) * 100 ELSE 0 END;
//       NEW.cvl := CASE WHEN NEW.leads_base_planilhas_vendas > 0 THEN NEW.leads_base_rd / NEW.leads_base_planilhas_vendas ELSE 0 END;
//       NEW.leads_orcamento := CASE WHEN NEW.orcamentos_semana > 0 THEN (NEW.leads_base_rd / NEW.orcamentos_semana) * 100 ELSE 0 END;
//       NEW.orcamento_pedido := CASE WHEN NEW.pedidos_semana > 0 THEN (NEW.orcamentos_semana / NEW.pedidos_semana) * 100 ELSE 0 END;
//
//       SELECT * INTO hist FROM public.campanhas_historico_semanal WHERE campanha_id = NEW.id ORDER BY criado_em DESC LIMIT 1;
//       IF FOUND THEN
//           NEW.dif_cliques_base_rd := NEW.cliques_base_rd - hist.cliques_base_rd_semana_anterior;
//           NEW.dif_leads_base_rd := NEW.leads_base_rd - hist.leads_base_rd_semana_anterior;
//       ELSE
//           NEW.dif_cliques_base_rd := NEW.cliques_base_rd;
//           NEW.dif_leads_base_rd := NEW.leads_base_rd;
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION calculate_canais_metrics()
//   CREATE OR REPLACE FUNCTION public.calculate_canais_metrics()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.lead_orcamento_pct := CASE WHEN NEW.orcamentos_qtd > 0 THEN (NEW.leads / NEW.orcamentos_qtd) * 100 ELSE 0 END;
//       NEW.orcamento_pedido_pct := CASE WHEN NEW.pedidos_qtd > 0 THEN (NEW.orcamentos_qtd / NEW.pedidos_qtd) * 100 ELSE 0 END;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: canais_comunicacao
//   trg_calculate_canais_metrics: CREATE TRIGGER trg_calculate_canais_metrics BEFORE INSERT OR UPDATE ON public.canais_comunicacao FOR EACH ROW EXECUTE FUNCTION calculate_canais_metrics()
// Table: outros_canais
//   trg_calc_outros_canais: CREATE TRIGGER trg_calc_outros_canais BEFORE INSERT OR UPDATE ON public.outros_canais FOR EACH ROW EXECUTE FUNCTION calc_outros_canais()
// Table: performance_campanha
//   trg_calc_performance_campanha: CREATE TRIGGER trg_calc_performance_campanha BEFORE INSERT OR UPDATE ON public.performance_campanha FOR EACH ROW EXECUTE FUNCTION calc_performance_campanha_new()

// --- INDEXES ---
// Table: clientes
//   CREATE UNIQUE INDEX clientes_cnpj_key ON public.clientes USING btree (cnpj)
// Table: pedidos
//   CREATE UNIQUE INDEX pedidos_numero_rastreio_key ON public.pedidos USING btree (numero_rastreio)
// Table: transportadoras
//   CREATE UNIQUE INDEX transportadoras_nome_key ON public.transportadoras USING btree (nome)
