import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const createAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'support@idysf.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Malema589624001.01';

    try {
        console.log(`Checking if admin user exists: ${adminEmail}`);

        // Check if user exists in Auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        let adminUser = users.find(u => u.email === adminEmail);

        if (!adminUser) {
            console.log(`Creating admin user: ${adminEmail}`);
            const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: { role: 'admin' },
                app_metadata: { role: 'admin' }
            });

            if (createError) throw createError;
            adminUser = user;
            console.log('Admin user created successfully in Auth.');
        } else {
            console.log('Admin user already exists in Auth. Ensuring role is set...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
                user_metadata: { role: 'admin' },
                app_metadata: { role: 'admin' }
            });
            if (updateError) throw updateError;
        }
        console.log('Updating profile role to admin...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', adminUser.id);

        if (profileError) {
            console.warn('Could not update profile role (it might not exist yet):', profileError.message);
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: adminUser.id,
                    email: adminEmail,
                    role: 'admin'
                });
            if (upsertError) throw upsertError;
        }

        console.log('Admin privileges granted successfully.');
    } catch (error) {
        console.error('Error in admin creation script:', error.message || error);
    }
};

createAdmin();
