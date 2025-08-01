"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, CheckCircle, ArrowLeft, Lock, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("professional")
  const [isLoading, setIsLoading] = useState(false)
  const [billingType, setBillingType] = useState("monthly")
  const router = useRouter()

  const plans = {
    "per-article": {
      name: "Por Artigo",
      price: 15,
      monthlyPrice: 15, // Para consistência de tipo
      yearlyPrice: 15, // Mesmo preço pois é por artigo
      features: ["Pagamento por artigo gerado", "Formatação básica", "Suporte por email", "Exportação PDF"],
      billing: "per-use",
    },
    professional: {
      name: "Profissional",
      price: 79, // Para consistência de tipo
      monthlyPrice: 79,
      yearlyPrice: 790, // 10 meses pelo preço de 12
      features: ["5 artigos por mês", "Todos os recursos", "Suporte prioritário", "Gráficos avançados"],
      billing: "monthly",
    },
    institutional: {
      name: "Institucional",
      price: 2388, // Para consistência de tipo
      monthlyPrice: 199,
      yearlyPrice: 2388, // 12 meses obrigatório
      features: [
        "Artigos ilimitados",
        "Múltiplos usuários (até 10)",
        "Contrato anual obrigatório",
        "API personalizada",
        "Suporte dedicado 24/7",
      ],
      billing: "annual-only",
    },
  }

  const currentPlan = plans[selectedPlan as keyof typeof plans]
  let currentPrice = 0
  let billingText = ""

  if (selectedPlan === "per-article") {
    currentPrice = currentPlan.price
    billingText = "Por artigo"
  } else if (selectedPlan === "institutional") {
    currentPrice = currentPlan.yearlyPrice
    billingText = "Anual (obrigatório)"
  } else {
    currentPrice = billingType === "monthly" ? currentPlan.monthlyPrice : currentPlan.yearlyPrice
    billingText = billingType === "monthly" ? "Mensal" : "Anual"
  }

  const discount =
    selectedPlan === "professional" && billingType === "yearly"
      ? Math.round((1 - currentPlan.yearlyPrice / (currentPlan.monthlyPrice * 12)) * 100)
      : 0

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Integração com Hotmart API
      const hotmartPayment = await createHotmartPayment()

      if (hotmartPayment.success) {
        // O Hotmart retorna uma URL de checkout, então redirecionamos para lá
        window.location.href = hotmartPayment.checkout_url
      } else {
        alert("Erro no pagamento. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      alert("Erro no pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const createHotmartPayment = async () => {
    // Integração com Hotmart API
    const paymentData = {
      plan_id: selectedPlan,
      billing_cycle: billingType,
      customer: {
        name: "Nome do Cliente",
        email: "cliente@email.com",
        phone: "(11) 99999-9999",
        document: "123.456.789-00",
      },
    }

    try {
      // Chamada para Hotmart API
      const response = await fetch("/api/hotmart/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success) {
        return { 
          success: true, 
          checkout_url: result.checkout_url,
          payment_id: result.payment_id 
        }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error("Erro na integração Hotmart:", error)
      return { success: false, error: "Erro de conexão" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/auth/register" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao cadastro
          </Link>
          <Link href="/" className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">IA</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">iArtigo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Assinatura</h1>
          <p className="text-gray-600">Escolha seu plano e método de pagamento</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seleção de Plano */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu Plano</CardTitle>
                <CardDescription>Selecione o plano ideal para suas necessidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan !== "per-article" && selectedPlan !== "institutional" && (
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant={billingType === "monthly" ? "default" : "outline"}
                      onClick={() => setBillingType("monthly")}
                      size="sm"
                    >
                      Mensal
                    </Button>
                    <Button
                      variant={billingType === "yearly" ? "default" : "outline"}
                      onClick={() => setBillingType("yearly")}
                      size="sm"
                    >
                      Anual
                      {discount > 0 && <Badge className="ml-2 bg-green-100 text-green-800">-{discount}%</Badge>}
                    </Button>
                  </div>
                )}

                {selectedPlan === "per-article" && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Pagamento por uso:</strong> Você paga apenas pelos artigos que gerar, sem mensalidade.
                    </p>
                  </div>
                )}

                {selectedPlan === "institutional" && (
                  <div className="p-3 bg-purple-50 rounded-lg mb-4">
                    <p className="text-sm text-purple-700">
                      🏛️ <strong>Plano Institucional:</strong> Contrato anual obrigatório com desconto especial para
                      universidades.
                    </p>
                  </div>
                )}

                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          R${" "}
                          {key === "per-article"
                            ? plan.price
                            : billingType === "monthly"
                              ? plan.monthlyPrice
                              : plan.yearlyPrice}
                        </div>
                        <div className="text-sm text-gray-600">
                          /{key === "per-article" ? "artigo" : billingType === "monthly" ? "mês" : "ano"}
                        </div>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Método de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Método de Pagamento
                </CardTitle>
                <CardDescription>Pagamento seguro processado pelo Hotmart - Checkout otimizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Checkout Hotmart</p>
                      <p className="text-sm text-gray-600">
                        Cartão de Crédito, PIX, Boleto e mais opções disponíveis no checkout
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>✅ Múltiplas formas de pagamento</p>
                  <p>✅ Processamento seguro</p>
                  <p>✅ Checkout otimizado para conversão</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Plano {currentPlan.name}</span>
                  <span className="font-medium">
                    R${" "}
                    {selectedPlan === "per-article"
                      ? currentPlan.price
                      : billingType === "monthly"
                        ? currentPlan.monthlyPrice
                        : currentPlan.yearlyPrice}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Cobrança</span>
                  <span>{billingText}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Desconto anual</span>
                    <span>-{discount}%</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {currentPrice}</span>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Cobrança recorrente {billingText}</p>
                  <p>• Cancele a qualquer momento</p>
                  <p>• Suporte incluído</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Pagamento Seguro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Criptografia SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Processado pelo Hotmart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                "Processando pagamento..."
              ) : (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  Finalizar Pagamento - R$ {currentPrice}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>
                Ao finalizar, você concorda com nossos{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Termos de Serviço
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
