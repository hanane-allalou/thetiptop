import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Gift } from "lucide-react"

export default function HomePage() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#fdf4dc', 
        backgroundImage: `
          radial-gradient(1200px 400px at 10% -20%, rgba(255,215,0,.25), transparent 55%), 
          radial-gradient(1000px 300px at 110% 120%, rgba(255,105,180,.18), transparent 60%), 
          linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))
        `,
       
        backdropFilter: 'blur(6px)'
      }}
    >
      
          <div className="container mx-auto px-[6px] sm:px-[14px] py-[28px] sm:py-[60px]">                   
        <div className="text-center mb-12 sm:mb-16 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold font-fairplay text-custom-gold mb-6" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            ADMINISTRATION
          </h1>
          <p className="text-lg sm:text-xl text-amber-900 font-fairplay" style={{ opacity: 0.95 }}>
            Système de gestion du jeu-concours pour la 10ème boutique de Nice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto">
          <Card 
            className="p-6 sm:p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden" 
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-amber-900 font-fairplay text-2xl sm:text-3xl text-center sm:text-left">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600" style={{ filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.5))' }} />
                Interface Administrateur
              </CardTitle>
              <CardDescription className="text-lg sm:text-xl text-amber-800 mt-4 text-center sm:text-left" style={{ opacity: 0.92 }}>
                Accédez aux statistiques, gérez les utilisateurs et préparez les campagnes emailing
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <Link to="/admin">
                <Button 
                  className="w-full py-3 sm:py-4 text-lg sm:text-xl font-bold hover:scale-105 transition-transform" 
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#1e293b',
                    boxShadow: '0 4px 15px rgba(255,215,0,0.5)',
                    borderRadius: '8px'
                  }}
                >
                  Accéder au Dashboard Admin ✨
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card 
            className="p-6 sm:p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden" 
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-amber-900 font-fairplay text-2xl sm:text-3xl text-center sm:text-left">
                <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-pink-600" style={{ filter: 'drop-shadow(0 2px 4px rgba(255,105,180,0.5))' }} />
                Interface Employé
              </CardTitle>
              <CardDescription className="text-lg sm:text-xl text-amber-800 mt-4 text-center sm:text-left" style={{ opacity: 0.92 }}>
                Vérifiez les tickets gagnants et marquez les lots comme remis en toute sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6">
              <Link to="/employee">
                <Button 
                  className="w-full py-3 sm:py-4 text-lg sm:text-xl font-bold hover:scale-105 transition-transform" 
                  style={{
                    background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
                    color: '#1e293b',
                    boxShadow: '0 4px 15px rgba(255,105,180,0.5)',
                    borderRadius: '8px'
                  }}
                >
                  Accéder à l'Interface Employé ✨
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

