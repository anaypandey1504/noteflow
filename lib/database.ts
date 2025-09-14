import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'data.json');

// In-memory database for development
let database: any = {
  tenants: [],
  users: [],
  notes: []
};

// Load database from file or create new one
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      database = JSON.parse(data);
    }
  } catch (error) {
    console.log('Creating new database...');
    database = { tenants: [], users: [], notes: [] };
  }
}

// Save database to file
function saveDatabase() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize database tables and default data
export function initDatabase() {
  loadDatabase();

  // Initialize tenants if empty
  if (database.tenants.length === 0) {
    database.tenants = [
      { id: 1, slug: 'acme', name: 'Acme Corp', subscription_plan: 'free', created_at: new Date().toISOString() },
      { id: 2, slug: 'globex', name: 'Globex Corp', subscription_plan: 'free', created_at: new Date().toISOString() }
    ];
  }

  // Initialize users if empty
  if (database.users.length === 0) {
    const passwordHash = bcrypt.hashSync('password', 10);
    database.users = [
      { id: 1, email: 'admin@acme.test', password_hash: passwordHash, role: 'admin', tenant_id: 1, created_at: new Date().toISOString() },
      { id: 2, email: 'user@acme.test', password_hash: passwordHash, role: 'member', tenant_id: 1, created_at: new Date().toISOString() },
      { id: 3, email: 'admin@globex.test', password_hash: passwordHash, role: 'admin', tenant_id: 2, created_at: new Date().toISOString() },
      { id: 4, email: 'user@globex.test', password_hash: passwordHash, role: 'member', tenant_id: 2, created_at: new Date().toISOString() }
    ];
  }

  // Initialize notes if empty
  if (database.notes.length === 0) {
    database.notes = [];
  }

  saveDatabase();
  return Promise.resolve();
}

// Database helper functions
export const dbHelpers = {
  get: async (sql: string, params: any[] = []) => {
    // Simple SQL parsing for our use cases
    const query = sql.toLowerCase().trim();
    
    if (query.includes('select') && query.includes('from')) {
      let table = '';
      if (query.includes('from tenants')) table = 'tenants';
      else if (query.includes('from users')) table = 'users';
      else if (query.includes('from notes')) table = 'notes';
      
      if (table) {
        let results = [...database[table]];
        
        // Handle WHERE clauses
        if (query.includes('where')) {
          const whereIndex = query.indexOf('where');
          const whereClause = query.substring(whereIndex + 5).trim();
          
          // Simple parameter substitution
          let processedClause = whereClause;
          params.forEach((param, index) => {
            processedClause = processedClause.replace('?', `"${param}"`);
          });
          
          // Apply filters (simplified)
          if (processedClause.includes('id =')) {
            const idMatch = processedClause.match(/id = "(\d+)"/);
            if (idMatch) {
              results = results.filter((row: any) => row.id === parseInt(idMatch[1]));
            }
          }
          if (processedClause.includes('tenant_id =')) {
            const tenantIdMatch = processedClause.match(/tenant_id = "(\d+)"/);
            if (tenantIdMatch) {
              results = results.filter((row: any) => row.tenant_id === parseInt(tenantIdMatch[1]));
            }
          }
          if (processedClause.includes('email =')) {
            const emailMatch = processedClause.match(/email = "([^"]+)"/);
            if (emailMatch) {
              results = results.filter((row: any) => row.email === emailMatch[1]);
            }
          }
          if (processedClause.includes('slug =')) {
            const slugMatch = processedClause.match(/slug = "([^"]+)"/);
            if (slugMatch) {
              results = results.filter((row: any) => row.slug === slugMatch[1]);
            }
          }
        }
        
        // Handle JOIN clauses
        if (query.includes('join')) {
          if (query.includes('join tenants t on u.tenant_id = t.id')) {
            results = results.map((user: any) => {
              const tenant = database.tenants.find((t: any) => t.id === user.tenant_id);
              return { ...user, tenant_slug: tenant?.slug };
            });
          }
        }
        
        // Handle COUNT
        if (query.includes('count(*)')) {
          return { count: results.length };
        }
        
        // Return first result for single row queries
        return results.length > 0 ? results[0] : null;
      }
    }
    
    return null;
  },

  all: async (sql: string, params: any[] = []) => {
    const query = sql.toLowerCase().trim();
    
    if (query.includes('select') && query.includes('from')) {
      let table = '';
      if (query.includes('from tenants')) table = 'tenants';
      else if (query.includes('from users')) table = 'users';
      else if (query.includes('from notes')) table = 'notes';
      
      if (table) {
        let results = [...database[table]];
        
        // Handle WHERE clauses
        if (query.includes('where')) {
          const whereIndex = query.indexOf('where');
          const whereClause = query.substring(whereIndex + 5).trim();
          
          // Simple parameter substitution
          let processedClause = whereClause;
          params.forEach((param, index) => {
            processedClause = processedClause.replace('?', `"${param}"`);
          });
          
          // Apply filters
          if (processedClause.includes('tenant_id =')) {
            const tenantIdMatch = processedClause.match(/tenant_id = "(\d+)"/);
            if (tenantIdMatch) {
              results = results.filter((row: any) => row.tenant_id === parseInt(tenantIdMatch[1]));
            }
          }
        }
        
        // Handle ORDER BY
        if (query.includes('order by updated_at desc')) {
          results = results.sort((a: any, b: any) => 
            new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
          );
        }
        
        return results;
      }
    }
    
    return [];
  },

  run: async (sql: string, params: any[] = []) => {
    const query = sql.toLowerCase().trim();
    
    if (query.includes('insert into')) {
      const tableMatch = query.match(/insert into (\w+)/);
      if (tableMatch) {
        const table = tableMatch[1];
        const newId = database[table].length > 0 ? Math.max(...database[table].map((r: any) => r.id)) + 1 : 1;
        
        let newRow: any = { id: newId };
        
        if (table === 'notes') {
          newRow = {
            id: newId,
            title: params[0],
            content: params[1],
            tenant_id: params[2],
            user_id: params[3],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else if (table === 'users') {
          newRow = {
            id: newId,
            email: params[0],
            password_hash: params[1],
            role: params[2],
            tenant_id: params[3],
            created_at: new Date().toISOString()
          };
        }
        
        database[table].push(newRow);
        saveDatabase();
        return { lastID: newId, changes: 1 };
      }
    }
    
    if (query.includes('update')) {
      const tableMatch = query.match(/update (\w+)/);
      if (tableMatch) {
        const table = tableMatch[1];
        let changes = 0;
        
        if (table === 'notes') {
          const id = params[2];
          const noteIndex = database.notes.findIndex((n: any) => n.id === parseInt(id));
          if (noteIndex !== -1) {
            database.notes[noteIndex].title = params[0];
            database.notes[noteIndex].content = params[1];
            database.notes[noteIndex].updated_at = new Date().toISOString();
            changes = 1;
          }
        }
        
        if (table === 'tenants') {
          const id = params[1];
          const tenantIndex = database.tenants.findIndex((t: any) => t.id === parseInt(id));
          if (tenantIndex !== -1) {
            database.tenants[tenantIndex].subscription_plan = 'pro';
            changes = 1;
          }
        }
        
        saveDatabase();
        return { lastID: 0, changes };
      }
    }
    
    if (query.includes('delete from')) {
      const tableMatch = query.match(/delete from (\w+)/);
      if (tableMatch) {
        const table = tableMatch[1];
        let changes = 0;
        
        if (table === 'notes') {
          const id = params[0];
          const noteIndex = database.notes.findIndex((n: any) => n.id === parseInt(id));
          if (noteIndex !== -1) {
            database.notes.splice(noteIndex, 1);
            changes = 1;
          }
        }
        
        saveDatabase();
        return { lastID: 0, changes };
      }
    }
    
    return { lastID: 0, changes: 0 };
  }
};

// Initialize database on module load
loadDatabase();