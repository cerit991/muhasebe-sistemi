"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/lib/hooks/use-api"
import { useState } from "react"

export default function SettingsPage() {
  const { toast } = useToast()
  const { fetchApi, loading } = useApi()
  const [settings, setSettings] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    darkMode: false,
    notifications: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await fetchApi('settings')
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu"
      })
    }
  }

  const handleSubmit = async () => {
    try {
      await fetchApi('settings', {
        method: 'POST',
        body: settings
      })

      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu"
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Şirket Bilgileri</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">Şirket Adı</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Telefon</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Adres</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taxNumber" className="text-right">Vergi No</Label>
              <Input
                id="taxNumber"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sistem Ayarları</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Karanlık Mod</Label>
                <div className="text-sm text-muted-foreground">
                  Karanlık tema tercihini ayarlayın
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bildirimler</Label>
                <div className="text-sm text-muted-foreground">
                  Sistem bildirimlerini yönetin
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  )
}