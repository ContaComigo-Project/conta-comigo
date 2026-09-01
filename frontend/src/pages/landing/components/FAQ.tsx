import { useState } from 'react';

const faqsList = [
  {
    question: 'O que é o Open Finance e como funciona?',
    answer: 'O Open Finance é um sistema que permite o compartilhamento seguro de dados financeiros entre instituições autorizadas pelo Banco Central. Com sua autorização, podemos acessar informações de suas contas para oferecer uma visão consolidada de suas finanças.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta a ponta, seguimos as diretrizes da LGPD e todas as normas de segurança do Banco Central. Seus dados são protegidos com os mais altos padrões de segurança da indústria.',
  },
  {
    question: 'Quais bancos são suportados?',
    answer: 'Suportamos todos os bancos participantes do Open Finance no Brasil, incluindo Itaú, Bradesco, Banco do Brasil, Santander, Nubank, Inter, e muitos outros. A lista está em constante expansão.',
  },
  {
    question: 'O ContaComigo é gratuito?',
    answer: 'Sim! No lançamento, o ContaComigo é 100% gratuito para todas as funcionalidades que você vê — Open Finance, diagnósticos de IA, orçamento por categoria, simulações de compra e exportação de relatórios. Não há planos pagos nem limites escondidos.',
  },
  {
    question: 'Como a Inteligência Artificial utiliza os meus dados?',
    answer: 'A IA do ContaComigo analisa seu histórico financeiro de forma estritamente privada para gerar insights e categorizar transações. Seus dados são protegidos por criptografia de ponta, cumprem rigorosamente a LGPD e nunca são compartilhados ou utilizados para treinar modelos públicos.',
  },
  {
    question: 'Como posso cancelar minha conta?',
    answer: 'Você pode cancelar sua conta a qualquer momento através das configurações da plataforma. Todos os seus dados serão removidos conforme nossa política de privacidade.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#f8f9fa]">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#001b42]">Perguntas Frequentes</h2>
          <p className="text-lg text-gray-500 max-w-160 mx-auto">
            Tire suas dúvidas sobre o ContaComigo
          </p>
        </div>

        <div className="max-w-200 mx-auto">
          {faqsList.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white rounded-xl mb-6 overflow-hidden shadow-sm">
                <button 
                  className="w-full py-6 px-8 bg-none border-none text-left text-lg font-semibold text-[#001b42] cursor-pointer flex justify-between items-center transition-colors hover:bg-[#f8f9fa]"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-down transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                <div 
                  className={`px-8 text-gray-500 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
