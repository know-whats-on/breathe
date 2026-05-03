import { useNavigate } from "react-router";
import { ArrowLeft, Phone, User, Heart } from "lucide-react";

export default function EmergencyContacts() {
  const navigate = useNavigate();

  const contacts = [
    {
      icon: Phone,
      name: "Emergency Services",
      number: "000",
      color: "#E88C5D",
      description: "For life-threatening emergencies",
    },
    {
      icon: User,
      name: "Dr. Sarah Johnson",
      number: "02 9876 5432",
      color: "#5A8BAF",
      description: "My regular doctor",
    },
    {
      icon: Heart,
      name: "Next of Kin",
      number: "0412 345 678",
      color: "#78B382",
      description: "Family contact",
    },
  ];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-[100dvh] bg-white max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-[#5A8BAF] text-white p-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center active:opacity-70"
        >
          <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
        </button>
        <h1 className="text-[36px] font-bold leading-[1.5]">Emergency Contacts</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${contact.color}20` }}
                >
                  <Icon
                    className="w-8 h-8"
                    style={{ color: contact.color }}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-[28px] font-bold text-[#222222] leading-[1.2]">
                    {contact.name}
                  </h2>
                  <p className="text-[20px] text-gray-600">{contact.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleCall(contact.number)}
                className="w-full h-20 rounded-2xl text-white flex items-center justify-center shadow-md transition-colors"
                style={{
                  backgroundColor: contact.color,
                  minHeight: "60px",
                }}
              >
                <Phone className="w-8 h-8 mr-3" strokeWidth={2.5} />
                <span className="text-[32px] font-bold">{contact.number}</span>
              </button>
            </div>
          );
        })}

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-orange-50 rounded-2xl border-2 border-[#E88C5D]">
          <p className="text-[24px] text-[#222222] leading-[1.5] text-center font-bold mb-2">
            Important
          </p>
          <p className="text-[20px] text-gray-700 leading-[1.5] text-center">
            If you experience severe breathlessness or chest pain, call 000 immediately
          </p>
        </div>
      </div>
    </div>
  );
}