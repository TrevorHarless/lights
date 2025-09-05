Here’s the full process in clean **Markdown format** so you can drop it into your docs or project notes:

---

# 🗑️ Delete User Account (Supabase + React Native + Expo)

This guide shows how to let users delete their own accounts securely.

---

## 🔑 Key Concept

- **Supabase Auth** does **not allow clients to delete themselves directly**.
- Only the **Service Role Key** can delete users.
- You’ll need an **Edge Function (or backend API)** that securely deletes accounts.

---

## ✅ Steps

### 1. Create an Edge Function

Make a new function called `delete-user.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role required
    );

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});
```

Deploy it:

```sh
supabase functions deploy delete-user --no-verify-jwt
```

---

### 2. Secure the Function

Require users to send their **JWT access token**.
Inside the Edge Function, you can verify it using `supabase.auth.getUser()` to ensure that the caller is authenticated.

---

### 3. Call the Function in React Native

In your profile screen, add a “Delete Account” button.

```tsx
import { supabase } from "../lib/supabase";

async function deleteAccount() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw userError || new Error("No user found");

    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("No session found");

    // Call your Edge Function
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error);

    // Log out after deletion
    await supabase.auth.signOut();

    alert("Account deleted successfully");
  } catch (err) {
    alert("Error deleting account: " + err.message);
  }
}
```

Button component:

```tsx
<Button title="Delete Account" onPress={deleteAccount} />
```

---

## 🛡️ Summary

1. **Client cannot directly delete accounts**.
2. **Edge Function (server-side)** deletes the account using the Service Role Key.
3. **React Native calls the function** with the user’s ID + access token.
4. Function deletes user → client logs out.

---

👉 Do you want me to extend this Markdown with the **JWT verification code snippet** inside the Edge Function so that only the logged-in user can delete their own account?
