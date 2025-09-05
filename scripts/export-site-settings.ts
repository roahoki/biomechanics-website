#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';
import { getSupabaseClient } from '../src/lib/supabase-db';

interface SiteSettingsRecord {
  id: string;
  data: any;
  created_at?: string;
  updated_at?: string;
}

async function exportSiteSettings() {
  console.log('🚀 Iniciando exportación de site_settings desde Supabase...');
  
  try {
    // Obtener datos desde Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    if (error) {
      console.error('❌ Error al obtener datos de Supabase:', error.message);
      process.exit(1);
    }
    
    if (!data) {
      console.warn('⚠️  No se encontraron datos en Supabase para id="default"');
      process.exit(1);
    }
    
    console.log('✅ Datos obtenidos correctamente desde Supabase');
    console.log('📊 Información del registro:');
    console.log(`   - ID: ${data.id}`);
    console.log(`   - Creado: ${data.created_at || 'N/A'}`);
    console.log(`   - Actualizado: ${data.updated_at || 'N/A'}`);
    console.log(`   - Tiene datos: ${data.data ? 'Sí' : 'No'}`);
    
    // Preparar datos para exportar
    const exportData: SiteSettingsRecord = {
      id: data.id,
      data: data.data,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    // Escribir archivo JSON
    const outputPath = join(process.cwd(), 'site_settings.json');
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log('💾 Archivo guardado exitosamente:');
    console.log(`   📁 Ruta: ${outputPath}`);
    
    // Mostrar un resumen del contenido
    if (data.data && typeof data.data === 'object') {
      const linksCount = data.data.links?.length || 0;
      const categoriesCount = data.data.categories?.length || 0;
      console.log('📋 Contenido exportado:');
      console.log(`   - Enlaces: ${linksCount}`);
      console.log(`   - Categorías: ${categoriesCount}`);
      console.log(`   - Título: ${data.data.title || 'N/A'}`);
      console.log(`   - Descripción: ${data.data.description || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    process.exit(1);
  }
}

// Ejecutar el script
exportSiteSettings()
  .then(() => {
    console.log('🎉 Exportación completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
