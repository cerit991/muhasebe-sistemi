import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  TrendingUp,
  PieChart,
  Shield,
  Banknote
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Profesyonel Muhasebe Yönetim Sistemi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            İşletmenizin finansal operasyonlarını kapsamlı muhasebe ve finans yönetim çözümümüzle optimize edin
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Başlayın
              </Button>
            </Link>
            <Link href="/reports">
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Raporları Görüntüle
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold">Fatura Yönetimi</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Profesyonel faturalar oluşturun, ödemeleri takip edin ve alacaklarınızı izleyin
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold">Finansal Takip</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Gelir, gider ve doğru finansal kayıtları tutmak için kapsamlı defter sistemi
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold">Gelişmiş Analitik</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Bilinçli iş kararları almak için detaylı raporlar ve içgörüler oluşturun
            </p>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-12">Neden Bizi Seçmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Güvenli</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Finansal verileriniz için kurumsal düzeyde güvenlik
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-rose-100 dark:bg-rose-900 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-rose-600 dark:text-rose-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ölçeklenebilir</h3>
              <p className="text-gray-600 dark:text-gray-300">
                İşletmenizin ihtiyaçlarıyla birlikte büyür
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-full mb-4">
                <Banknote className="w-8 h-8 text-amber-600 dark:text-amber-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Uygun Maliyetli</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Premium özelliklerle uygun fiyatlı çözüm
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Kullanıcı Dostu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Her seviyedeki kullanıcı için sezgisel arayüz
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Başlamaya Hazır mısınız?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Binlerce işletme finanslarını platformumuzla yönetiyor
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Hemen Deneyin
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}