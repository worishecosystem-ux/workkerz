// /app/data/shops.ts

import { supabase } from "@/lib/supabase";

/* ====================================================== */

export interface Shop {
  id: string;

  shop_uid?: string;

  serial_no?: number;

  joined_date?: string;

  created_at?: string;

  shop_name: string;

  owner_name: string;

  phone: string;

  email?: string;

  category?: string;

  address?: string;

  city?: string;

  state?: string;

  gst_number?: string;

  description?: string;

  logo?: string;

  banner?: string;

  status?: string;

  is_active: boolean;
}

/* ====================================================== */
/* FIX GOOGLE DRIVE IMAGE */
/* ====================================================== */

function fixDriveImage(
  url?: string | null,
) {
  if (!url) {
    return "";
  }

  url = url.trim();

  if (
    !url.includes(
      "drive.google.com",
    )
  ) {
    return url;
  }

  let fileId = "";

  /* open?id= */

  const openMatch =
    url.match(
      /open\?id=([^&]+)/,
    );

  if (
    openMatch?.[1]
  ) {
    fileId =
      openMatch[1];
  }

  /* /file/d/ */

  if (!fileId) {
    const fileMatch =
      url.match(
        /\/file\/d\/([^/]+)/,
      );

    if (
      fileMatch?.[1]
    ) {
      fileId =
        fileMatch[1];
    }
  }

  /* thumbnail?id= */

  if (!fileId) {
    const thumbMatch =
      url.match(
        /thumbnail\?id=([^&]+)/,
      );

    if (
      thumbMatch?.[1]
    ) {
      fileId =
        thumbMatch[1];
    }
  }

  /* generic id= */

  if (!fileId) {
    const genericMatch =
      url.match(
        /id=([^&]+)/,
      );

    if (
      genericMatch?.[1]
    ) {
      fileId =
        genericMatch[1];
    }
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url;
}
/* ====================================================== */
/* MAP SHOP */
/* ====================================================== */

function mapShop(
  shop: any,
): Shop {
  return {
    id: shop.id || "",

    shop_uid:
      shop.shop_uid || "",

    serial_no:
      shop.serial_no || 0,

    joined_date:
      shop.joined_date ||
      shop.created_at ||
      "",

    created_at:
      shop.created_at || "",

    shop_name:
      shop.shop_name || "",

    owner_name:
      shop.owner_name || "",

    phone:
      shop.phone || "",

    email:
      shop.email || "",

    category:
      shop.category || "",

    address:
      shop.address || "",

    city:
      shop.city || "",

    state:
      shop.state || "",

    gst_number:
      shop.gst_number ||
      "",

    description:
      shop.description ||
      "",

    logo:
      fixDriveImage(
        shop.logo,
      ),

    banner:
      fixDriveImage(
        shop.banner,
      ),

    status:
      shop.status ||
      "offline",

    is_active:
      shop.status ===
      "online",
  };
}

/* ====================================================== */
/* GET ALL SHOPS */
/* ====================================================== */

export async function getShops(): Promise<
  Shop[]
> {
  try {
    const { data, error } =
      await supabase
        .from("shops")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.log(error);

      return [];
    }

    return (
      data?.map(mapShop) ||
      []
    );
  } catch (err) {
    console.log(err);

    return [];
  }
}

/* ====================================================== */
/* GET SINGLE SHOP */
/* ====================================================== */

export async function getShop(
  id: string,
) {
  try {
    const { data, error } =
      await supabase
        .from("shops")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.log(error);

      return null;
    }

    return mapShop(data);
  } catch (err) {
    console.log(err);

    return null;
  }
}

/* ====================================================== */
/* ADD SHOP */
/* ====================================================== */

export async function addShop(
  shop: Partial<Shop>,
) {
  try {
    const { count } =
      await supabase
        .from("shops")
        .select("*", {
          count: "exact",
          head: true,
        });

    const serialNo =
      (count || 0) + 1;

    const now = new Date();

    const month = String(
      now.getMonth() + 1,
    ).padStart(2, "0");

    const year =
      now.getFullYear();

    const shopUID = `EA-${year}${month}-${String(
      serialNo,
    ).padStart(4, "0")}`;

    const { data, error } =
      await supabase
        .from("shops")
        .insert([
          {
            shop_uid:
              shopUID,

            serial_no:
              serialNo,

            joined_date:
              now.toISOString(),

            shop_name:
              shop.shop_name ||
              "",

            owner_name:
              shop.owner_name ||
              "",

            phone:
              shop.phone || "",

            email:
              shop.email || "",

            category:
              shop.category ||
              "",

            address:
              shop.address ||
              "",

            city:
              shop.city || "",

            state:
              shop.state ||
              "",

            gst_number:
              shop.gst_number ||
              "",

            description:
              shop.description ||
              "",

            logo:
              fixDriveImage(
                shop.logo,
              ),

            banner:
              fixDriveImage(
                shop.banner,
              ),

            status:
              shop.is_active
                ? "online"
                : "offline",
          },
        ])
        .select()
        .single();

    if (error) {
      console.log(error);

      return null;
    }

    return mapShop(data);
  } catch (err) {
    console.log(err);

    return null;
  }
}

/* ====================================================== */
/* UPDATE SHOP */
/* ====================================================== */

export async function updateShop(
  id: string,
  shop: Partial<Shop>,
) {
  try {
    const { data, error } =
      await supabase
        .from("shops")
        .update({
          shop_name:
            shop.shop_name,

          owner_name:
            shop.owner_name,

          phone:
            shop.phone,

          email:
            shop.email || "",

          category:
            shop.category || "",

          address:
            shop.address || "",

          city:
            shop.city || "",

          state:
            shop.state || "",

          gst_number:
            shop.gst_number ||
            "",

          description:
            shop.description ||
            "",

          logo:
            fixDriveImage(
              shop.logo,
            ),

          banner:
            fixDriveImage(
              shop.banner,
            ),

          status:
            shop.is_active
              ? "online"
              : "offline",
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      console.log(error);

      return null;
    }

    return mapShop(data);
  } catch (err) {
    console.log(err);

    return null;
  }
}

/* ====================================================== */
/* DELETE SHOP */
/* ====================================================== */

export async function deleteShop(
  id: string,
) {
  try {
    const { error } =
      await supabase
        .from("shops")
        .delete()
        .eq("id", id);

    if (error) {
      console.log(error);

      return false;
    }

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
}

/* ====================================================== */
/* TOGGLE STATUS */
/* ====================================================== */

export async function toggleShopStatus(
  id: string,
  isActive: boolean,
) {
  try {
    const nextStatus =
      isActive
        ? "online"
        : "offline";

    const { data, error } =
      await supabase
        .from("shops")
        .update({
          status: nextStatus,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      console.log(
        "TOGGLE SHOP ERROR:",
        error,
      );

      return null;
    }

    return mapShop(data);
  } catch (err) {
    console.log(err);

    return null;
  }
}