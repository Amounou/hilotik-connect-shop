-- Tighten order insertion: authenticated users must use their own user_id; anon must not impersonate
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anon can create guest orders"
ON public.orders FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated create own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- order_items: keep open insert but require parent order to belong to caller (or be guest)
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Anon create items for guest orders"
ON public.order_items FOR INSERT TO anon
WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id IS NULL));

CREATE POLICY "Authenticated create items for own orders"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL)));
