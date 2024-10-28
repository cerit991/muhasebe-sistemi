export interface MenuItem {
    id: string
    code: string
    name: string
    description: string | null
    price: number
    ingredients: MenuIngredient[]
    totalCost: number
    profitMargin: number
    createdAt: Date
    updatedAt: Date
  }
  
  export interface MenuIngredient {
    id: string
    menuItemId: string
    productId: string
    quantity: number
    product: {
      name: string
      price: number
      unit: string
    }
  }
  
  export interface CreateMenuItemDTO {
    name: string
    description?: string | null
    price: number
    ingredients: Array<{
      productId: string
      quantity: number
    }>
  }